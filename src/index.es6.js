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



// WHAT KIND OF WORLD DO WE LIVE IN!?
console.log(verse, actions);




// Model and Controller
var renderDims = [15, 15];
var gameLand = new Land(Math.random, { dims: renderDims });
var logic = new Logic(gameLand);
render.Renderer.dims = renderDims;

var paused = flyd.stream(false);





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
// Print live vlalues to UI
var renderLiveDebug = (data) => {
	var u = ui.debug.selectAll('li').data(data);
	var e = u.enter().append('li');
	e.append('span');

	[u].map((sel) => {
		sel.select('span').text((d) => `${d.label} : ${d.value}`);
	});
};
flyd.on(renderLiveDebug, logCollect);









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
var timeWarp = 5000; // each ms = 10 minutes

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
	var body = d3.select(document.body);

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

	// Apply classes to body
	var classStatus = verse.sol.map(
		(x) => 'sol-' + x.name.split(' ').join('-')).concat(verse.luna.map(
		(x) => 'luna-' + x.name.split(' ').join('-'))
	).map((name) => [name, name === 'sol-' + circadian.sol.name.split(' ').join('-') || name === 'luna-' + circadian.luna.name.split(' ').join('-')]);
	d3.select(document.body).classed(_.fromPairs(classStatus));
	
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














//////////         ~~ INPUT stat ~~            //////////



// @todo: move into its own module

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



var commandState = flyd.immediate(flyd.combine(
	(a, b) => _.merge({}, a(), b()),
	[keyCommands, touchCommands]
));










/////////////////////////////// Enter Dawg //////////////////////////


// A way to build actors
var actorFactory = new ActorFactory(verse.actors.proto);
var gameActor = (name, pos) => {
	var newActor = actorFactory.actor(name, pos);
	gameLand.add(newActor);
	return newActor;
};




// Debug UI for factory
var BehaviourDebug = require('./behaviour/debug/debug.es6');
var behaviourDebug = new BehaviourDebug(paused);




// Player stuff
var player = gameActor('dawg', [10, 10]);
logValues(player.life.map((x) => x.pos.join(',')), 'Dawg Paws');

var tileUnderPlayer = flyd.stream({});
logValues(tileUnderPlayer.map(JSON.stringify), 'Tile');

logic.add(
	// Player mover is a command + state based cardnal mover
	gimmicks.move.player(commandState, tileUnderPlayer, player)
)

logic.add(() => {
	ui.map.classed('sniffing', player.status.sniffing);
}, 100);

var playerCam = render.Camera(render.Renderer, { target: player, source: gameLand });
render.Renderer.add(playerCam);












// Let's make a generic human -- he'll just live in the world
gameActor('human', [3, 4]);

// And how about on each 'h' press
var makeHuman = _.throttle(() => {
	var c = $.getChunk(renderDims, player.pos);
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
}, 500);
logic.add((land, delta) => {
	var state = commandState();
	if (state['human'])
	{
		makeHuman();
	}
});



















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
















////////////////// UI COMPONENT - ACTIONS

// A dawg centric view
var targetSelecter = ui.controls.append('section').attr('id', 'target');
ui.actions = ui.controls.append('div').attr('id','actions');

// [Source] > [Target]
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
		possibleActions = _.uniq(fromMap.concat(actions.getVerbs(source, target, land)));
	}

	render.joinElt('option', sourceSelect, _.map(actors, (actor) => actor.sprite));
	render.joinElt('option', targetSelect, _.map(actors, (actor) => actor.sprite));

	render.joinElt('div', ui.actions, possibleActions)
		.call((sel) => {
			sel.classed('button', true)
		})
		// Pass the action event onto the flow
		// @todo: inject locals better than just here
		.on('click', (d) => flowAction(d, {
			source,
			target,
			land,
			actorFactory
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
			var evolve = actorFactory.actorsByName[_.sample(evolution.next)];	
			_.merge(plant, evolve);
		}
	});
}, 100);



























// call our renderers?
var renderFn = () => {
	render.Renderer.to(ui.map);
};


// Main Update Loop
var lastTime = time();
var update = (time) => {
	var delta = time - lastTime;		// The time that has past
	
	if (!paused())
	{
		logic.step(delta, time);						// Tells us how to change
	}

	renderFn();									// The results of which we see
	lastTime = time;					// Then we step forward
};
flyd.on(update, time);



























//////////////// @ global access @ ////////////////////

window.game = {
	verse,
	gimmicks,
	render,
	actions,
	$,
	streams,
	keyboardState
};
