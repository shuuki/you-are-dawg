'use strict';

var _ = require('lodash');
var $ = require('../core/core.es6');
var Mod = require('../core/mod.es6');


// Action Factory Helpers
var getArgs = (fn) => {
	var str = fn.toString();
	var start = str.indexOf('(');
	var end = str.indexOf(')');
	var slice = str.slice(start+1, end);
	return slice.split(',').map((x) => x.trim());
}

var actionLookup = {};
var makeAction = (label, fn) => {
	var requires = getArgs(fn)
	var action = { label, requires, fn };
	action.toString = () => label;
	actionLookup[label] = action;
	return action;
};

/**
 * Do an action given an environment
 * @param  {Action} action - The action to perform
 * @param  {Object} environment - Object satisfying action's requirements
 * @return {String[]} - Summary of results of the action
 */
var doAction = (action, environment) => {
	// map requirement strings to instances from environment
	var locals = _.map(action.requires,
		(requirement) => environment.locals[requirement]);

	// Return result of action
	return action.fn.apply(undefined, locals);
}


makeAction('sniff',
	(source, target) => {
		return `${source} sniffs ${target}`;
	});



makeAction('bark',
	(source, target) => {
		var log = [`${source} barks at ${target}`];

		if(_.has(target, 'status.affect.fearful'))
		{
			target.status.affect.fearful += 2;

			var response = $.getBin('0', undefined, [
					[5, `${target} is feeling uneasy`],
					[10, `${target} is looking for an exit`],
					[15, `${target} starts to sweat`],
					[30, `${target} backs away`, () => Mod.backAway(2, target, source)],
					[45, `${target} urinated in fear`]
			], target.status.affect.fearful);

			// Run any functions
			if (response[2])
			{
				response[2]();
			}

			// Push the message
			log.push(response[1]);
		}

		return log;
	});



makeAction('growl', (source, target) => {
	return `${source} growls at ${target}`;
});



makeAction('check', (source, target) => {
	return `${source} inspects ${target}`;
});





makeAction('bite',
	(source, target) => {
		if (!_.has(target, 'status.hp'))
		{
			return `${source} bites ${target} -> It has no effect`;
		}

		if (target.status.hp > 0)
		{
			target.status.hp -= 2;
		}

		return `${source} bites ${target} -> ${target.status.hp}`;
	});




makeAction('treat',
	(source, target) => {
		source.hp += 5;

		return [
			`${source} gives ${target} a treat`,
			`${target} trusts ${source} a little more`
		];
	});





makeAction('throw stick',
	(source, land, actorFactory, direction) => {
		direction = direction || [_.random(-5, 5), _.random(-5, 5)];
		var stick = actorFactory.actor('stick', $.Vec.sum(source.pos, direction));
		land.add(stick);

		var log = [JSON.stringify(stick)];
		return `${source} throws a stick ${$.dist(stick.pos, source.pos).toFixed(2)} ft away`;
	});



makeAction('pick up',
	(source, target, land) => {
		if ($.Vec.eq(source.pos, target.pos))
		{
			land.remove(target);
			return `${source} picked up the ${target}`;
		}
		else
		{
			return `${source} is too far from ${target}!`;
		}
	});




var verbMap = {
	dawg: {
		dawg: ['sniff', 'growl', 'check'],
		human: ['sniff'],
		seed: ['sniff']
	},
	human: {
		dawg: ['treat']
	}
};




// Or another way
var getVerbs = (source, target, land) => {
	var verbs = [];

	// Animals can sniff
	if (_.includes(source.tags, 'animal'))
	{
		verbs.push('sniff');
	}

	if (_.includes(source.tags, 'fierce'))
	{
		verbs.push('bark', 'growl', 'bite');
	}

	if (source.name === 'human')
	{
		verbs.push('throw stick');
	}

	if (_.includes(target.tags, 'grab'))
	{
		verbs.push('pick up');
	}

	return verbs;
};

















module.exports = {
	makeAction, doAction,
	verbs: actionLookup,
	verbMap,
	getVerbs
};