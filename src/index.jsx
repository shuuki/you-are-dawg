// Libs
var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');
flyd.obj = require('flyd/module/obj');
flyd.scanmerge = require('flyd/module/scanmerge');
flyd.dropRepeats = require('flyd/module/droprepeats').dropRepeats;
flyd.previous = require('flyd/module/previous');

var chance = require('chance');
var d3 = require('d3');
var _ = require('lodash');

// Deps
var verse = require('./data.jsx');				// A universe of data
var $ = require('./core.jsx');						// Core nice stuff 
var streams = require('./streams.jsx');		// Stream goodies
var render = require('./render.jsx');			// My eyes still work
var gimmicks = require('./gimmicks.jsx');	// A joke here, some bones there
var Logic = require('./logic.jsx');				// A wise man once

// Style
require('./index.less');




var getNumber = () => Math.random();




// Model and Controller
var renderDims = [25, 25];
var gameLand = new render.Land(getNumber, { dims: renderDims });
var logic = new Logic(gameLand);
render.Renderer.dims = renderDims;



// Shortcuts
var time = streams.time;
var log = streams.log;
var w = window;

var __logI = 0;
var logCollect = flyd.stream([]);
var logValues = (stream, label) => {
	label = label || '' + __logI++;
	var dedupe = flyd.dropRepeats(stream);

	flyd.on((v) => {
		var arr = logCollect();
		var x = _.find(arr, { label });
		if (!x) { x = { label }; arr.push(x); }
		x.value = v;
		logCollect(arr);
	}, dedupe);

	flyd.on(() => {
		var arr = logCollect();
		_.remove(arr, { label });
		logCollect(arr);
	}, dedupe.end);
	
	return stream;
}



// Frames per second (I prefer millis per frame)
logValues(
	streams.movingAverage(120, // keep 120 frames in average
		flyd.previous(time).map(
			(p) => isNaN(p) ? 0 : 1000 / (time() - p)
		)
	).map((x) => x.toFixed(2)), 'FPS');


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






/////////////////////////////// Enter Dawg //////////////////////////




var gameNode = d3.select(document.body)
	.append('div')
	.classed('game', true);





//////////////
// Some actors / state
//////////////

// Actors -- Living things in the world. A lookup.
var actorsByName = _.indexBy(verse.actors, 'name');

/**
 * Make a new actor with a default name and position.
 * Shapes loaded from `actorsByName`
 *
 * @name Actor
 * @typedef {object} Actor
 * @prop {string} name - What should I look up?
 * @prop {object} status - Arbitrary shape status object for now
 * @prop {[number, number]} pos
 * @prop {stream<Actor>} life - stream of own value. Used to update on mutation.
 */
var actor = (name, pos) => {
	name = name || 'nothing';
	var newActor = _.cloneDeep(actorsByName[name]);
	newActor.pos = !pos ? [0, 0] : pos;

	newActor.status = {};
	newActor.life = flyd.stream(newActor);

	return newActor;
};

// Get an actor + add to game
var gameActor = (name, pos) => {
	var newActor = actor(name, pos);
	gameLand.add(newActor);
	return newActor;
};

var cooldown = (max, current) => {
	return { max, current: !current ? 0 : current };
}




// Let's make some actors
var player = gameActor('dawg', [10, 10]);

// some player-only stuff
_.merge(player.status, { sniffing: false, move: cooldown(250) });

logValues(player.life.map((x) => x.pos.join(',')), 'Dawg Paws');
var tileUnderPlayer = flyd.stream({});
logValues(tileUnderPlayer.map(JSON.stringify));

// Move the player by keys
var playerMover = (cells, delta) => {
	// Snap to max is someone shortened it
	player.status.move.current = Math.min(player.status.move.current, player.status.move.max);
	if (player.status.move.current > 0)
	{
		player.status.move.current -= delta;
	}
	var commands = commandState();
	player.status.sniffing = !_.isEmpty(commands.sniff);
	player.status.move.max = player.status.sniffing ? 250 : 25;

	if (!_.isEmpty(commands) && player.status.move.current <= 0)
	{
		player.pos = _.reduce(commands, (pos, v, dir) => gimmicks.move.cardinal(dir, pos), player.pos);
		player.status.move.current = player.status.move.max;
	}

	// tileUnderPlayer(_.pluck(cells, 'actors'));

	// @todo: check if changed
	player.life(player);
};
logic.add(playerMover); // No time given 





// A camera lense into gameLand
var playerCam = render.Camera(render.Renderer, { target: player, source: gameLand });
render.Renderer.add(playerCam);





// An experiment with life?
var seeds = [actor('seed')];
logic.add((cells, delta) => {
	seeds.forEach((seed) => {
		var localSeed = $.toLocal(cells.pos.dims, cells.pos.pos, seed.pos);
		if (!(isNaN(localSeed[0]) || isNaN(localSeed[1])))
		{
			if ($.Rect.contains(cells.pos, localSeed))
			{
				console.log('!');
				// var contents = cells[localSeed[1]][localSeed[0]];
			}
		}
	});
});












// @todo: finish minimap render
var mapCam = () => {
	var pt = player.pos();
	console.log(pt);
	return [[]];
}
render.Minimap.add(mapCam);
















// DOM element to render game into
var map = gameNode.append('div').classed('map', true);
var renderFn = () => render.Renderer.to(map);

logic.add(() => {
	map.classed('sniffing', player.status.sniffing);
}, 100);


// Main Update Loop
var lastTime = time();
var update = (time) => {
	var delta = time - lastTime;		// The time that has past
	logic.step(delta);						// Tells us how to change
	renderFn();									// The results of which we see
	lastTime = time;					// Then we step forward
};
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

// Debug live values
var logger = gameNode.append('div').classed('logger', true).append('ul');
var renderLiveDebug = (data) => {
	var u = logger.selectAll('li').data(data);
	var e = u.enter().append('li');
	e.append('b');
	e.append('span');

	[u, e].map((sel) => {
		sel.select('b').text((d) => d.label + ':');
		sel.select('span').text((d) => d.value);
	});
};
flyd.on(renderLiveDebug, logCollect);



// log(logCollect);
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
