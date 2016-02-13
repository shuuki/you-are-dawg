var Tether = require('tether');

// Lots of flyd
var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');
flyd.scanmerge = require('flyd/module/scanmerge');
flyd.dropRepeats = require('flyd/module/droprepeats').dropRepeats;

var moment = require('moment');
moment.defaultFormat = 'HH:mm';

var chance = require('chance');
var d3 = require('d3');
var _ = require('lodash');

// It is
var verse = require('./data/verse.es6');
var plants = require('./data/plants.es6');
var ActorFactory = require('./simulation/ActorFactory.es6');

// It knows
var $ = require('./core/core.es6');
var streams = require('./core/streams.es6');


// It thinks
var gimmicks = require('./simulation/gimmicks.es6');
var Logic = require('./simulation/logic.es6');
var actions = require('./simulation/actions.es6');


// It moves
var render = require('./render/render.es6');
var Land = require('./render/land.es6');
var renderKeyboard = render.jade(require('./render/keyboard.jade'));


// It's pretty
var ui = require('./render/ui.es6')(document.body);
require('./css/index.less');


// Model and Controller
var renderDims = [15, 15];
var minimapChunks = [3, 3];
var gameLand = new Land(Math.random, { dims: renderDims });
var logic = new Logic(gameLand);
render.Renderer.dims = renderDims;
render.Minimap.dims = $.Vec.mult(minimapChunks, renderDims);



// Shortcuts
var time = streams.time;
var log = streams.log;
var w = window;


// Logging
var __logI = 0;
var logCollect = flyd.stream([]);
var logValues = (stream, label) => {
	label = label || '' + __logI++;
	var dedupe = flyd.dropRepeats(stream);

	flyd.on(_logValue(label), dedupe);

	flyd.on(() => {
		_removeLog(label);
	}, dedupe.end);
	
	return stream;
}
// Helpers for logValues
var _logValue = _.curry((label, v) => {
	var arr = logCollect();
	var x = _.find(arr, { label });
	if (!x) { x = { label }; arr.push(x); }
	x.value = v;
	logCollect(arr);
}, 2);
var _removeLog = (label) => {
	var arr = logCollect();
		_.remove(arr, { label });
		logCollect(arr);
};



///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
// I WENT DEEP ON TIME, GUYS
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
// Time conversions to drive the universe
// Relative multipler for deltas
// Higher value = faster steps forward in time
var timeWarp = 2; // each ms = 10 minutes

// Map of conversions for this planet's seasons
var planetTime = { // Earth based
	// hour -> day
	day: 24,
	// day -> month
	month: 30,
	// month -> year
	year: 52
};

// Our rhythms are well defined
var circadian = {
	now: 0,
	day: 0, month: 0, year: 0,
	hour: 0, minute: 0, second: 0,
	sol: verse.sol[0], luna: verse.luna[0]
};

var fromMillis = {
	second: 1000,
	minute: 1000 * 60,
	hour: 1000 * 60 * 60
};
// Specific to local planet
fromMillis.day = planetTime.day * fromMillis.hour;
fromMillis.month = planetTime.month * fromMillis.day;
fromMillis.year = planetTime.year * fromMillis.month;


var clock = d3.select(document.body).append('div').classed('clock', true);
var secondHand = clock.append('div').classed('second', true);
var minuteHand = clock.append('div').classed('minute', true);
var hourHand = clock.append('div').classed('hour', true);


var bin = (base, start, end) => (base / start) % end;
logic.add((land, delta) => {

	// Relative to start
	circadian.now += delta * timeWarp;
	circadian.second = bin(circadian.now, fromMillis.second, 60);
	circadian.minute = bin(circadian.now, fromMillis.minute, 60);
	circadian.hour = bin(circadian.now, fromMillis.hour, planetTime.day);
	circadian.day = bin(circadian.now, fromMillis.day, planetTime.month);
	circadian.month = bin(circadian.now, fromMillis.month, planetTime.year);
	circadian.year = bin(circadian.now, fromMillis.year, Number.MAX_SAFE_INTEGER);
	circadian.sol = $.getBin('time', undefined, verse.sol, circadian.hour);
	circadian.luna = $.getBin('limit', undefined, verse.luna, circadian.month % 1);

	_logValue('Time', `${_.padStart(Math.floor(circadian.hour), 2, '0')}:${_.padStart(Math.floor(circadian.minute), 2, '0')}:${_.padStart(Math.floor(circadian.second), 2, '0')}`);
	_logValue('Date', `${circadian.day.toFixed(2)} / ${circadian.month.toFixed(2)} / ${circadian.year.toFixed(4)}`);
	_logValue('sol', circadian.sol.name);
	_logValue('luna', circadian.luna.name);
	return circadian;
});



///////////////////////
///////////////////////
///////////////////////
///////////////////////
///////////////////////
///////////////////////
///////////////////////
///////////////////////
///////////////////////



// Frames per second (I prefer millis per frame)
logValues(streams.fps(120, time).map((x) => x.toFixed(2)), 'FPS');


console.log(verse, actions);		// Let me hear you shout







// Key state
var getWhich = $.get('which');
var gameControls = _.keys(verse.controls.defaultControls);
var filterKeys = flyd.filter($.inMap(verse.controls.defaultControls));
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
var keyCommands = keyboardState.map(
		(x) => _(x)
		.toPairs()
		.filter((a) => a[1])
		.map((a) => a[0])
		.groupBy((key) => verse.controls.defaultControls[key])
		.value()
);








var touchCommands = flyd.combine((start, move, end, self, changes) => {
	var rect = ui.map.node().getBoundingClientRect();

	var commands = {
		North: $.Rect.create(
			[rect.height * 0.25, rect.width],
			[rect.top, rect.left]
		),
		East: $.Rect.create(
			[rect.height, rect.width * 0.25],
			[rect.top, rect.left + rect.width - rect.width * 0.25]
		),
		South: $.Rect.create(
			[rect.height * 0.25, rect.width],
			[rect.top + rect.height - rect.height * 0.25, rect.left]
		),
		West: $.Rect.create(
			[rect.height, rect.width * 0.25],
			[rect.top, rect.left]
		)
	};

	return changes.reduce((acc, s) => {
		var event = s();

		switch (event.type) {
			case 'touchstart':
			case 'touchmove':
				_.forEach(event.touches, (touch) => {
					var pos = [touch.pageY, touch.pageX];
					_.forEach(commands, (v, k) => {
						if ($.Rect.contains(v, pos))
						{
							event.preventDefault();
							acc[k] = [];
						}
					});
				});
			break;
		}

		return acc;
	}, {});
}, [
	streams.touch.start,
	streams.touch.move,
	streams.touch.end
]);

log(touchCommands);












var commandState = flyd.immediate(flyd.combine(
	(a, b) => _.merge({}, a(), b()),
	[keyCommands, touchCommands]
));



/////////////////////////////// Enter Dawg //////////////////////////



// A way to build actors
var actorFactory = new ActorFactory(verse.actors.proto);






//////////////
// Some actors / state
//////////////
var gameActor = (name, pos) => {
	var newActor = actorFactory.actor(name, pos);
	gameLand.add(newActor);
	return newActor;
};

var cooldown = (max, current) => {
	return { max, current: !current ? 0 : current };
};





// Player stuff
var player = gameActor('dawg', [10, 10]);
logValues(player.life.map((x) => x.pos.join(',')), 'Dawg Paws');




// Something to update
var tileUnderPlayer = flyd.stream({});
logValues(tileUnderPlayer.map(JSON.stringify), 'Tile');







// Move the player by keys
var playerMover = (land, delta) => {
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
	ui.map.classed('sniffing', player.status.sniffing);
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







// Let's make a generic human -- he'll just live in the world
gameActor('human', [3, 4]);


// And how about on each 'h' press
flyd.on(_.debounce((state) => {
	if (state['human'])
	{
		var tile = _.random();
		var c = $.getChunk(renderDims, player.pos)
		var freeSpace = _.reduce(gameLand.lastRect().land, (acc, row, r) => {
			row.forEach((col, c) => {
				if (col.actors.length <= 0)
				{
					acc.push([r, c]);
				}
			});
			return acc;
		}, []);
		
		if (freeSpace.length > 0 )
		{
			var localChunk = $.getChunk(renderDims, player.pos);
			var pos = $.localToWorld(renderDims, localChunk, _.sample(freeSpace));
			gameActor('human', pos);
		}
	}
}, 100, {leading: true}), commandState);



////////// ACTIONS?!
var flow = flyd.stream();
var flowAction = (verb, locals) => {
	if (!actions.verbs[verb]) throw new Error(`Verb ${verb} not found found.`);
	flow({
		action: actions.verbs[verb],
		locals
	});
};

var state = flyd.scan((acc, event) => {
	var processed = Date.now();
	acc.history.push([processed, event]);
	acc.last = actions.doAction(event.action, event);
	acc.log.push([processed, acc.last]);
	return acc;
}, {
	last: {},
	log: [],
	history: []
}, flow);

logValues(state.map((s) => {
	return JSON.stringify(s.last);
}), 'Results');





















// A dawg centric view
var targetSelecter = ui.controls.append('section').attr('id', 'target');
ui.actions = ui.controls.append('div').attr('id','actions');

// [Srouce] > [Target]
var sourceSelect = targetSelecter.append('select');
var swapBtn = targetSelecter.append('span').classed('button off', true).text('>');
var targetSelect = targetSelecter.append('select');
swapBtn.on('click', () => {
	var x = sourceSelect.node().selectedIndex;
	sourceSelect.node().selectedIndex = targetSelect.node().selectedIndex;
	targetSelect.node().selectedIndex = x;
})


logic.add((land, delta, actors) => {
	var cells = land.lastLand();
	var dawgChunk = $.getChunk(cells.dims, cells.pos);
	var possibleActions = [];

	// Read ui state
	var target = actors[targetSelect.node().selectedIndex];
	var source = actors[sourceSelect.node().selectedIndex];

	if (source && target)
	{
		var fromMap = _.get(actions.verbMap, `${source.name}.${target.name}`, []);
		possibleActions = _.uniq(fromMap.concat(actions.getVerbs(source, target, {})));
	}

	render.joinElt('option', sourceSelect, _.map(actors, (actor) => actor.sprite));
	render.joinElt('option', targetSelect, _.map(actors, (actor) => actor.sprite));

	render.joinElt('div', ui.actions, possibleActions)
		.call((sel) => {
			sel.classed('button', true)
		})
		// Pass the action event onto the flow
		.on('click', (d) => flowAction(d, {
			source,
			target,
			land
		}));

});




// RENDER EVENT RESULT LOG
flyd.on((state) => {
	var update = ui.log.selectAll('.entry').data(state.log);
	var enter = update.enter().append('div').classed('entry', true);
	update.attr('title', (d) => moment(d[0]).format())
	update.text((d) => JSON.stringify(d[1]));
	ui.log.property('scrollTop', ui.log.property('scrollHeight'));
}, state);














// A grim reaper?
logic.add((land, delta, actors) => {
	actors.forEach((actor) => {
		// Death brings seeds?
		if (actor.status.hp <= 0)
		{
			gameLand.remove(actor);
			gameActor('seed', actor.pos);
		}
	})
});









// Life begets life
var sun = {
	// gotta' stay safe
	entropy: Number.MAX_SAFE_INTEGER
};
gameActor('seed', [2, 6]);

// @todo: sun gives based on delta and circadian
logic.add((land, delta, actors) => {
	var sunGives = 1;

	land.getActors('plant').forEach((plant) => {
		if (sun.entropy > 0)
		{
			sun.entropy -= sunGives;
			plant.status.entropy += sunGives;
		}

		var evolution = plants.evolution[plant.name];
		if (evolution && plant.status.entropy >= evolution.entropy)
		{
			var evolve = actor(_.sample(evolution.next), plant.pos);
			_.merge(plant, evolve);
		}
	});
}, 100);






















// call our renderers?
var renderFn = () => {
	render.Renderer.to(ui.map);
	// render.Minimap.to(minimap);
};


// Main Update Loop
var lastTime = time();
var update = (time) => {
	var delta = time - lastTime;		// The time that has past
	logic.step(delta, time);						// Tells us how to change
	renderFn();									// The results of which we see
	lastTime = time;					// Then we step forward
};
flyd.on(update, time);
























// Render keyboard state
// var keyDispaly = keys.append('div');
// var commandDisplay = keys.append('div');
// flyd.on((state) => renderKeyboard(keyDispaly, { data: _.toPairs(state) }), keyboardState);
// flyd.on((state) => renderKeyboard(commandDisplay, { data: _.toPairs(state) }), commandState);


// Debug live values
var renderLiveDebug = (data) => {
	var u = ui.debug.selectAll('li').data(data);
	var e = u.enter().append('li');
	e.append('span');

	[u].map((sel) => {
		sel.select('span').text((d) => `${d.label} : ${d.value}`);
	});
};
flyd.on(renderLiveDebug, logCollect);














// Since everything is made in d3 right now....
// Let's try using tether to wire them together...?
setTimeout(() => new Tether({
	element: ui.controls.node(), attachment: 'top left',
	target: ui.map.node(), targetAttachment: 'top right'
}), 100);





























//////////////// @ global access @ ////////////////////

window.game = {
	verse,
	gimmicks,
	render,
	$,
	streams,
	keyboardState
};
