'use strict';

var _ = require('lodash');

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






makeAction('sniff',
	(source, target) => {
		return `${source} sniffs ${target}`;
	});



makeAction('bark',
	(source, target) => {
		return `${source} barks at ${target}`;
	});



makeAction('growl', (source, target) => {
	return `${source} growls at ${target}`;
});



makeAction('check', (source, target) => {
	return `${source} inspects ${target}`;
});





makeAction('bite',
	(source, target) => {
		if (target.status.hp > 0)
		{
			target.status.hp -= 2;
		}
		return `${source} bites ${target} -> ${target.status.hp}`;
	})





var verbMap = {
	dawg: {
		dawg: ['sniff', 'bark', 'growl', 'check'],
		human: ['sniff'],
		seed: ['sniff']
	}
};




// Or another way
var getVerbs = (source, target, state) => {
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

	return verbs;
};

















module.exports = {
	makeAction,
	verbs: actionLookup,
	verbMap,
	getVerbs
};