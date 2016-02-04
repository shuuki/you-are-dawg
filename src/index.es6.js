// Lots of flyd
var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');
flyd.obj = require('flyd/module/obj');
flyd.scanmerge = require('flyd/module/scanmerge');
flyd.dropRepeats = require('flyd/module/droprepeats').dropRepeats;
flyd.previous = require('flyd/module/previous');

var chance = require('chance');
var d3 = require('d3');
var _ = require('lodash');

// It is
var verse = require('./data/data.es6');


// It knows
var $ = require('./core/core.es6');
var streams = require('./core/streams.es6');


// It thinks
var gimmicks = require('./simulation/gimmicks.es6');
var Logic = require('./simulation/logic.es6');
var actions = require('./simulation/actions.es6');


// It moves
var render = require('./render/render.es6');
var renderKeyboard = require('./render/keyboard.es6');


// It's pretty
require('./css/index.less');










var getNumber = () => Math.random();




// Model and Controller
var renderDims = [15, 15];
var minimapChunks = [3, 3];
var gameLand = new render.Land(getNumber, { dims: renderDims });
var logic = new Logic(gameLand);
render.Renderer.dims = renderDims;
render.Minimap.dims = $.Vec.mult(minimapChunks, renderDims);



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
	newActor.toString = () => newActor.name;
	gameLand.add(newActor);
	return newActor;
};

var cooldown = (max, current) => {
	return { max, current: !current ? 0 : current };
}





// Player stuff
var player = gameActor('dawg', [10, 10]);
_.merge(player.status, { sniffing: false, move: cooldown(250) });
logValues(player.life.map((x) => x.pos.join(',')), 'Dawg Paws');




// Something to update
var tileUnderPlayer = flyd.stream({});
logValues(tileUnderPlayer.map(JSON.stringify), 'Tile');







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
	player.status.move.max = player.status.sniffing ? 400 : 200;

	if (!_.isEmpty(commands) && player.status.move.current <= 0)
	{
		player.pos = _.reduce(commands, (pos, v, dir) => gimmicks.move.cardinal(dir, pos), player.pos);
		player.status.move.current = player.status.move.max;
	}

	tileUnderPlayer(gameLand.at(player.pos));

	// @todo: check if changed
	player.life(player);
};
logic.add(playerMover); // No time given 









// sniff sniff I found you
logic.add(() => {
	map.classed('sniffing', player.status.sniffing);
}, 100);









// A camera lense into gameLand
var playerCam = render.Camera(render.Renderer, { target: player, source: gameLand });
render.Renderer.add(playerCam);







// And a minimap
var minimapLand = () => {
	var data = gameLand._data;
	var cells = $.Arr2D.create(render.Minimap.dims[0], render.Minimap.dims[1]);
	var center = minimapChunks.map((x) => Math.floor(x / 2));
	var chunk = $.getChunk(render.Renderer.dims, player.pos);
	var srcSize = $.Rect.create(render.Renderer.dims, [0, 0]);
	
	for (var x = -center[0]; x < minimapChunks[0] - center[0]; x++)
	{
		for (var y = -center[1]; y < minimapChunks[1] - center[1]; y++)
		{
			var pos = $.Vec.diff(chunk, [x, y]);
			var key = gameLand.keyFn(pos);
			if (data[key])
			{
				// Top left to paste
				var offset = $.Vec.mult([-x + center[0], y + center[1]], render.Renderer.dims);
				
				for (var c = 0; c < data[key].length; c++)
				{
					for (var r = 0; r < data[key][c].length; r++)
					{
						cells[offset[1] + r][offset[0] + c] = { land: data[key][r][c]}
					}
				}
			}
		}
	}

	return cells;
};
render.Minimap.add(minimapLand);







// An experiment with life?
var seeds = [gameActor('seed', [5, 5])];
// logic.add((cells, delta) => {
// 	seeds.forEach((seed) => {
// 		var localSeed = $.toLocal(cells.dims, cells.pos, seed.pos);
// 		if (!(isNaN(localSeed[0]) || isNaN(localSeed[1])))
// 		{
// 			if ($.Rect.contains($.Rect.create(cells.dims, cells.pos), localSeed))
// 			{

// 			}
// 		}
// 	});
// });






var human = gameActor('human', [3, 4]);




////////// ACTIONS?!
var flow = flyd.stream();
var doAction = (verb, locals) => {
	flow({
		action: actions.verbs[verb],
		locals
	});
};







// NPC STATE?
var state = flyd.scan((acc, event) => {
	acc.history.push(event);
	var injectedLocals = _.map(event.action.requires, (label) => event.locals[label]);
	acc.last = event.action.fn.apply(undefined, injectedLocals);
	return acc;
}, {
	last: {},
	history: []
}, flow);

logValues(state.map((s) => {
	return JSON.stringify(s.last);
}), 'Results');





















// A dawg centric view
var actionDiv = gameNode.append('div').classed('actions', true);
actionDiv.append('label').text('Target');
var targetSelect = actionDiv.append('select').classed('target', true);
var targetBtns = actionDiv.append('div').classed('buttons', true);




logic.add((cells, delta, actors) => {
	var dawgChunk = $.getChunk(cells.dims, cells.pos);
	var possibleActions = [];

	var target = actors[targetSelect.node().selectedIndex];

	if (target)
	{
		possibleActions = _.get(actions.verbMap, 'dawg.' + target.name, []);
	}


	render.joinElt('buttion', targetBtns, possibleActions)
		.on('click', (d) => doAction(d, {
			source: player,
			target
		}));

	render.joinElt('option', targetSelect, _.map(actors, 'name'));
});













































// I enjoy being able to see
var map = gameNode.append('div').classed('map', true);
var minimap = gameNode.append('div').classed('minimap map', true);




// call our renderers?
var renderFn = () => {
	render.Renderer.to(map);
	// render.Minimap.to(minimap);
};


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
var keys = gameNode.append('div').classed('keys', true);
var keyDispaly = keys.append('div');
var commandDisplay = keys.append('div');
flyd.on((state) => renderKeyboard(keyDispaly, _.pairs(state)), keyboardState);
flyd.on((state) => renderKeyboard(commandDisplay, _.pairs(state)), commandState);


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







//////////////// @ global access @ ////////////////////


window.game = {
	verse,
	gimmicks,
	render,
	$,
	streams,
	keyboardState
};
