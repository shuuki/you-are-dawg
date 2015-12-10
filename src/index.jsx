// Libs
var flyd = require('flyd');
flyd.obj = require('flyd/module/obj');

var chance = require('chance');
var d3 = require('d3');
var _ = require('lodash');

// Deps
var verse = require('./data.jsx');			// A universe of data
var $ = require('./core.jsx');				// Core nice stuff 
var streams = require('./streams.jsx');		// Stream goodies
var render = require('./render.jsx');		// My eyes still work

// Style
require('./index.less');

// Shortcuts
var time = streams.time;
var log = streams.log;
var d = document;
var w = window;

console.log(verse);		// Let me hear you shout



// Print some things
//d.write("the first season is: " +
//				verse.season[0].name + "<br>");
//d.write("the phases of the moon are: " +
//				_.pluck(verse.moon, "name").join(", ") + "<br>");
//d.write("the total weight of all terrain is: " +
//				_.reduce(_.pluck(verse.land, "chance"), $.sum) + "<br>");

// fire off the finder to give me something... i got 99 problems but sprites ain't one
//var maplike = $.correlatum(Math.random, 99,
//	_.pluck(verse.land, 'sprite'),
//	_.pluck(verse.land, 'chance')).join('');
//d.write("here's a weighted pseudorandom blob: " +"<p class='glyph'>"+ maplike + "</p><br>");

// fire off the thing and tell me what time it is at 12
//d.write("12:00 is called " + $.correlator(_.pluck(verse.sun, "name"), _.pluck(verse.sun, "time"), 12) + "<br>")
//d.write("06:00 is called " + $.correlator(_.pluck(verse.sun, "name"), _.pluck(verse.sun, "time"), 6) + "<br>")

d.write('<hr>');





/////////////////
// Enter Dawg
/////////////////

var gameNode = d3.select(d.body).append('div').classed('game', true);

// Same seed every run for now
var seed = 314159;
var rand = new Chance(seed);
var getNumber = () => rand.random();



// Render config
var chunkWidth = 20;
var chunkHeight = 20;


// Chunk math -- transform points in different spaces
var getChunk = (pos) => [Math.floor(pos[0] / chunkWidth), Math.floor(pos[1] / chunkHeight)];
var toLocal = (chunk, pos) => [
	pos[0] - chunk[0] * chunkWidth,
	chunkHeight - (pos[1] - chunk[1] * chunkHeight) - 1
];


//////////////
// Some actors / state
//////////////

// THe world for now
var gameLand = new render.Land(getNumber, {w: chunkWidth, h: chunkHeight});


// Actors -- Living things in the world.
var actorsByName = _.indexBy(verse.actors, 'name');
var actor = (name, pos) => {
	var newActor = _.cloneDeep(actorsByName[name]);
	newActor.pos = !pos ? [0, 0] : pos;
	return flyd.obj.streamProps(newActor);
};


// Let's make a player
var player = actor('dawg', [10, 10]);
var bird = actor('bird', [-10, 9]);
var human = actor('human', [12, 5]);
var squirrel = actor('squirrel', [3, 5]);








////////////
// Gimmicks Playground
////////////

// Tree trail!
var treeTrail = flyd.on((pos) => {
	var chunk = getChunk(pos);
	var local = toLocal(chunk, pos);
	gameLand.at(chunk[0], chunk[1])[local[1]][local[0]] = '?';
});

// Draw a trail of trees! For the player
treeTrail(player.pos);
treeTrail(squirrel.pos);















// Make the squirrel move!
var update = streams.interval(100, () => {
	var cur = squirrel.pos();
	cur[0] = cur[0] + (1 - _.random(2));
	cur[1] = cur[1] + (1 - _.random(2));
	squirrel.pos(cur);
	
	var curBird = bird.pos();
	curBird[0] = curBird[0] + 1;
	curBird[1] = Math.random() < 0.3 ? (curBird[1] + Math.random() > 0.5 ? 1 : -1) : curBird[1];
	bird.pos(curBird);

	return [squirrel, bird];
});






var dogOnBones = flyd.combine((dog) => {
	var pos = dog();
	var chunk = getChunk(pos);
	var terrainChunk = gameLand.at(chunk[0], chunk[1]);
	var local = toLocal(chunk, pos);
	return terrainChunk[local[1]][local[0]] === '&';
}, [player.pos]);

var actorDistance = flyd.combine((a, b) => $.dist(a(), b()));

var distanceToHuman = actorDistance([player.pos, human.pos]);
var canTalkToHuman = distanceToHuman.map((x) => x < 1.5);
var canEatSquirrel = actorDistance([player.pos, squirrel.pos]).map((x) => x < 1);









///////////
// RENDER LOGIC
///////////
var activeChunk = player.pos.map(getChunk)		// Track the player


// Actors to render
var actorStreams = [bird, human, squirrel, player].map(flyd.obj.stream);

// Updated when actors change
var actorLayer = flyd.combine(function()
{
	var actors = Array.prototype.slice.call(arguments, 0, -2);
	var chunk = activeChunk();
	var actorsToRender = actors
		.map((x) => x())
		.filter((x) => _.isEqual(getChunk(x.pos), chunk));

	var emptyMap = _.chunk(_.map(new Array(chunkWidth * chunkHeight), (x) => 'a'), chunkWidth);
	
	actorsToRender.forEach((actor) => {
		var local = toLocal(chunk, actor.pos);
		if (_.isArray(actor.sprite))
		{
			actor.sprite.forEach((row, yOffset) => {
				row.forEach((cell, xOffset) => {
					if (local[1] + yOffset < chunkWidth && local[0] + xOffset < chunkHeight)
					emptyMap[local[1] + yOffset][local[0] + xOffset] = cell;
				});
			});
		}
		else
		{
			emptyMap[local[1]][local[0]] = actor.sprite;
		}
	});
	
	emptyMap = emptyMap.slice(0, chunkHeight).map((row) => row.slice(0, chunkWidth));
	
	return emptyMap.map((x) => x.join(''));
}, actorStreams);



///////////
// Camera view
///////////
var cameraView = flyd.combine((chunk) => {
	var chunkPos = chunk();
	
	var land = _.cloneDeep(
		gameLand.at(chunkPos[0], chunkPos[1])
	);
	
	return land.map((x) => x.join(''));
}, [activeChunk, time]);


////////
// Render it all to the DOM as p-tags?
////////

// DOM element to render game into
var map = gameNode.append('div').classed('map', true);

// Render land row array onto a d3 selection map
var renderMap = (map, land) => {
	var rows = map.selectAll('p').data(land);
	// Render the data as text
	[
		rows,							// d3 update 
	 	rows.enter()			// and endter
			.append('p')
			.classed('glyph', true)
	].forEach((sel) => sel.text((d) => d));
	
	// Cleanup
	rows.exit().remove();
};

// Bind and attach render
var boundRender = _.partial(renderMap, map);
flyd.on(boundRender, cameraView);				// Render active

// Actor overlay
var map2 = gameNode.append('div').classed('actor map', true);
flyd.on(_.partial(renderMap, map2), actorLayer);




// Applies class to selection based on boolean eval of stream's val
var classFrom = (className, selection, stream) => flyd.on((val) => selection.classed(className, !!val), stream);
// Apply '.other' to map2 if dogOnBones
classFrom('other', map2, dogOnBones);
classFrom('faded', map, canTalkToHuman);
classFrom('other', map, canEatSquirrel);







// Move pos stream in a cardinal manor
var cardinal = (directionStream, pos) => {
	return directionStream.map((direction) => {
		var currentPos = pos();
		switch (direction) {
			case 'East':
				currentPos[0] = currentPos[0] + 1;
				break;
			case 'West':
				currentPos[0] = currentPos[0] - 1;
				break;
			case 'North':
				currentPos[1] = currentPos[1] + 1;
				break;
			case 'South':
				currentPos[1] = currentPos[1] - 1;
				break;
		}
		pos(currentPos);
	});
}

// Map keys to key codes
var keyToDirection = streams.lookup(
	verse.controls,
	streams.keys.map((x) => x.which)	// Map out key code
);

// Moves player.pos on events from keyToDirection
cardinal(keyToDirection, player.pos);









//////////
//	Minimap code. Perfect for now.
//////////
var minimap = gameNode.append('div').classed('minimap map', true);
var minimapData = [];
var chunks = flyd.combine((chunk) => {
	var currentChunk = chunk();
	var data = gameLand._data;
	var discoveredCells = _.keys(data);
	var pairs = discoveredCells.map((str) => str.split(',').map((x) => +x));
	var xBounds = [
		_.min(_.pluck(pairs, '0')),
		_.max(_.pluck(pairs, '0'))
	];
	var yBounds = [
		_.min(_.pluck(pairs, '1')),
		_.max(_.pluck(pairs, '1'))
	];
	var emptyMap = _.chunk(
					_.map(new Array(chunkWidth * chunkHeight), (x) => 'a'),
					chunkWidth);
	
	var rows = [];
	for (var y = yBounds[1]; y >= yBounds[0]; y--)
	{
		var row = [];
		for (var x = xBounds[0]; x <= xBounds[1]; x++)
		{
			var key = gameLand.keyFn(x, y);
			if (data[key] === undefined)
			{
				row.push(emptyMap);
			}
			else
			{
				row.push(data[key]);
			}
		}
		rows.push(row);
	}
	
	
	var out = rows.reduce((acc, row, i) => {
		// Chunk row => actual row
		var reducedRow = row.reduce((acc, chunk) => {
			chunk.map((x) => x.join('')).forEach((row, i) => {
				if (acc[i] === undefined) { acc[i] = ''; };
				acc[i] += row;
			});
			return acc;
		}, []);
		
		reducedRow.forEach((row) => acc.push(row));
		
		
		return acc;
	}, []);

	renderMap(minimap, out);
}, [activeChunk, time]);
