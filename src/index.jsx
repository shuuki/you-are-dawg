// Libs
var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');
flyd.obj = require('flyd/module/obj');
flyd.scanmerge = require('flyd/module/scanmerge');
flyd.dropRepeats = require('flyd/module/droprepeats').dropRepeats;

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

// Key state
var getWhich = $.get('which');
var gameControls = _.keys(verse.controls);
var filterKeys = flyd.filter($.inMap(verse.controls));
var whichDown = filterKeys(streams.keys.down.map(getWhich));
var whichUp = filterKeys(streams.keys.up.map(getWhich));

var filterUndefined = flyd.filter($.neq(undefined));

var keyboardState = flyd.scanmerge([
	// On down, increase
	[whichDown, (state, key) => {
		state[key] = true;
		return state;
	}],
	// On up, reduce count
	[whichUp, (state, key) => {
		state[key] = false;
		return state;
	}]
], _.zipObject(gameControls, gameControls.map(_.constant(0))));

// Transform the keys into {command: keys pressed that are triggering}
var commandState = keyboardState.map(
	(x) => _(x)
	.pairs()
	.filter((a) => a[1])
	.map((a) => a[0])
	.groupBy((key) => verse.controls[key])
	.value()
);

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

// The world for now
var gameLand = new render.Land(getNumber);

// Actors -- Living things in the world.
var actorsByName = _.indexBy(verse.actors, 'name');
var actor = (name, pos) => {
	var newActor = _.cloneDeep(actorsByName[name]);
	newActor.pos = !pos ? [0, 0] : pos;

	// Also push into the world
	gameLand.add(newActor);

	return newActor;
};





// Let's make some actors
var player = actor('dawg', [10, 10]);











// Move the player based on keyboard
var directions = ['North', 'South', 'East', 'West'];
// Select from keybord state where a direction-key is down
var activeDirection = $.pickFilter(directions, (x) => x[1] > 0);
var moveCommands = keyboardState.map(activeDirection);











// A camera lense into gameLand

var playerCam = render.Camera(render.Renderer, { target: player, source: gameLand });
render.Renderer.add(playerCam);


// DOM element to render game into
var map = gameNode.append('div').classed('map', true);
var renderFn = () => render.Renderer.to(map);

// Main Update Loop
var update = (time) => {
	renderFn(); // Render
	// console.log(time, render.Renderer, map);
};


// Trigger update on time
flyd.on(update, time);









// Render keyboard state
var renderKeyboard = (selection, data) => {
	var u = selection.selectAll('li').data(data);
	var e = u.enter().append('li');

	[u, e].map((sel) => {
		sel.classed('active', (d) => d[1]).text((d) => d[0]);
	});

	u.exit().remove();

	return u;
};

var keyDisplay = gameNode.append('div').classed('keys', true);

keyDisplay.append('h6').text('Mapped Key Codes');
var keyCodes = keyDisplay.append('ul');

keyDisplay.append('h6').text('Active Commands');
var activeCommands = keyDisplay.append('ul');

flyd.on((state) => renderKeyboard(keyCodes, _.pairs(state)), keyboardState);
flyd.on((state) => renderKeyboard(activeCommands, _.pairs(state)), commandState);



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
	streams,
	keyboardState
};
