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
var whichDown = flyd.dropRepeats(streams.keys.down.map(getWhich));
var whichUp = streams.keys.up.map(getWhich);

var filterUndefined = flyd.filter($.neq(undefined));
var mapKeys = (stream) => filterUndefined(streams.lookup(verse.controls, stream));

var keyboardState = flyd.scanmerge([
	[mapKeys(whichDown), (state, key) => { if (!state[key]) state[key] = 0; state[key]++; return state; }],
	[mapKeys(whichUp), (state, key) => { state[key]--; return state; }]
], _.zipObject(verse.commands));


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















// A camera lense into gameLand
var camera = (config) => {
	var half = _.partialRight($.div, 2);
	
	var fn = function()
	{
		var renderPoint = _.zip(this.target.pos, [render.Renderer.width, render.Renderer.height])
			.map($.diff).map(half);
		return config.source.getRect(this.target.pos, render.Renderer.width, render.Renderer.height);
	};

	fn.target = config.target;

	return fn;
}
var playerCam = camera({ target: player, source: gameLand });
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
	var e = u.enter().append('li').text((d) => d[0]);

	[u, e].map((sel) => {
		sel.classed('down', (d) => d[1] > 0);
	});

	u.exit().remove();

	return u;
};
var keys = gameNode.append('ul').classed('keys', true);
flyd.on((state) => renderKeyboard(keys, _.pairs(state)), keyboardState);




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
