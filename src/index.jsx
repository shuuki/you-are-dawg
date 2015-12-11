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
var gimmicks = require('./gimmicks.jsx');	// A joke here, some bones there

// Style
require('./index.less');

// Shortcuts
var time = streams.time;
var log = streams.log;
var w = window;

console.log(verse);		// Let me hear you shout

/////////////////
// Enter Dawg
/////////////////

var gameNode = d3.select(document.body)
	.append('div')
	.classed('game', true);

// Same seed every run for now
var seed = 314159;
var rand = new Chance(seed);
var getNumber = () => rand.random();

// Change render dims
render.Renderer.width = render.Renderer.height = 40;


//////////////
// Some actors / state
//////////////

// THe world for now
var gameLand = new render.Land(getNumber);

// Some facts
var directions = ['North', 'South', 'East', 'West'];

// Actors -- Living things in the world.
var actorsByName = _.indexBy(verse.actors, 'name');
var actor = (name, pos) => {
	var newActor = _.cloneDeep(actorsByName[name]);
	newActor.pos = !pos ? [0, 0] : pos;
	return newActor;
};

// Let's make some actors
var player = actor('dawg', [10, 10]);
var birds = _.map(new Array(250), () => actor('bird', [_.random(-50, 50), _.random(-50, 50)]));
var human = actor('human', [12, 5]);
var squirrel = actor('squirrel', [3, 5]);
















// Let's make a logical world
var logic = [];

var moveBirds = (birds) => {

}






// var dogOnBones = flyd.combine((dog) => {
// 	var pos = dog();
// 	var chunk = getChunk(pos);
// 	var terrainChunk = gameLand.at(chunk[0], chunk[1]);
// 	var local = toLocal(chunk, pos);
// 	return terrainChunk[local[1]][local[0]] === '&';
// }, [player.pos]);

// var distanceToHuman = actorDistance([player.pos, human.pos]);
// var canTalkToHuman = distanceToHuman.map((x) => x < 1.5);
// var canEatSquirrel = actorDistance([player.pos, squirrel.pos]).map((x) => x < 1);









///////////
// RENDER LOGIC
///////////
// var activeChunk = player.pos.map(getChunk)		// Track the player

// // Things to redraw actor layer with
// var actorStreams = birds.concat([squirrel, player, human]).map(flyd.obj.stream);

// // Updated when actors change
// var actorLayer = flyd.combine(function()
// {
// 	var actors = Array.prototype.slice.call(arguments, 0, -2);
// 	var chunk = activeChunk();
// 	var actorsToRender = actors
// 		.map((x) => x())
// 		.filter((x) => _.isEqual(getChunk(x.pos), chunk));

// 	var emptyMap = _.chunk(_.map(new Array(chunkWidth * chunkHeight), (x) => 'a'), chunkWidth);
	
// 	actorsToRender.forEach((actor) => {
// 		var local = toLocal(chunk, actor.pos);
// 		if (_.isArray(actor.sprite))
// 		{
// 			actor.sprite.forEach((row, yOffset) => {
// 				row.forEach((cell, xOffset) => {
// 					if (local[1] + yOffset < chunkWidth && local[0] + xOffset < chunkHeight)
// 					emptyMap[local[1] + yOffset][local[0] + xOffset] = cell;
// 				});
// 			});
// 		}
// 		else
// 		{
// 			emptyMap[local[1]][local[0]] = actor.sprite;
// 		}
// 	});
	
// 	emptyMap = emptyMap.slice(0, chunkHeight).map((row) => row.slice(0, chunkWidth));
	
// 	return emptyMap.map((x) => x.join(''));
// }, actorStreams);



// ///////////
// // Camera view
// ///////////
// var cameraView = flyd.combine((chunk) => {
// 	var chunkPos = chunk();
	
// 	var land = _.cloneDeep(
// 		gameLand.at(chunkPos[0], chunkPos[1])
// 	);
	
// 	return land.map((x) => x.join(''));
// }, [activeChunk, time]);




var getGameLandRect = () => gameLand.getRect(0, 0, render.Renderer.width, render.Renderer.height);
render.Renderer.add(getGameLandRect);





// DOM element to render game into
var map = gameNode.append('div').classed('map', true);
var renderFn = () => render.Renderer.to(map);

// Main Update Loop
var update = (time) => {
	renderFn(); // Render map
	// console.log(time, render.Renderer, map);
};


// Trigger update on time
flyd.on(update, time);












// Actor overlay
// var map2 = gameNode.append('div').classed('actor map', true);
// flyd.on(_.partial(renderMap, map2), actorLayer);




// Applies class to selection based on boolean eval of stream's val
// var classFrom = (className, selection, stream) => flyd.on((val) => selection.classed(className, !!val), stream);
// // Apply '.other' to map2 if dogOnBones
// classFrom('other', map2, dogOnBones);
// classFrom('faded', map, canTalkToHuman);
// classFrom('other', map, canEatSquirrel);


// Map keys to key codes
// var keyToDirection = streams.lookup(
// 	verse.controls,
// 	streams.keys.map((x) => x.which)	// Map out key code
// );

// Moves player.pos on events from keyToDirection
// cardinal(keyToDirection, player.pos);









//////////
//	Minimap code. Perfect for now.
//////////
// var minimap = gameNode.append('div').classed('minimap map', true);
// var minimapData = [];
// var chunks = flyd.combine((chunk) => {
// 	var currentChunk = chunk();
// 	var data = gameLand._data;
// 	var discoveredCells = _.keys(data);
// 	var pairs = discoveredCells.map((str) => str.split(',').map((x) => +x));
// 	var xBounds = [
// 		_.min(_.pluck(pairs, '0')),
// 		_.max(_.pluck(pairs, '0'))
// 	];
// 	var yBounds = [
// 		_.min(_.pluck(pairs, '1')),
// 		_.max(_.pluck(pairs, '1'))
// 	];
// 	var emptyMap = _.chunk(
// 					_.map(new Array(chunkWidth * chunkHeight), (x) => 'a'),
// 					chunkWidth);
	
// 	var rows = [];
// 	for (var y = yBounds[1]; y >= yBounds[0]; y--)
// 	{
// 		var row = [];
// 		for (var x = xBounds[0]; x <= xBounds[1]; x++)
// 		{
// 			var key = gameLand.keyFn(x, y);
// 			if (data[key] === undefined)
// 			{
// 				row.push(emptyMap);
// 			}
// 			else
// 			{
// 				row.push(data[key]);
// 			}
// 		}
// 		rows.push(row);
// 	}
	
	
// 	var out = rows.reduce((acc, row, i) => {
// 		// Chunk row => actual row
// 		var reducedRow = row.reduce((acc, chunk) => {
// 			chunk.map((x) => x.join('')).forEach((row, i) => {
// 				if (acc[i] === undefined) { acc[i] = ''; };
// 				acc[i] += row;
// 			});
// 			return acc;
// 		}, []);
		
// 		reducedRow.forEach((row) => acc.push(row));
		
		
// 		return acc;
// 	}, []);

// 	renderMap(minimap, out);
// }, [activeChunk, time]);








//////////////// @ global access @ ////////////////////


window.game = {
	verse,
	gimmicks,
	render,
	$,
	streams
};
