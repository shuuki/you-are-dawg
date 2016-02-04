'use strict';

var _ = require('lodash');

var actionLookup = {};
var makeAction = (label, requires, fn) => {
	fn.toString = () => label;
	var action = { label, requires, fn };
	actionLookup[label] = action;
	return action;
};






var sniff = makeAction('sniff',
	['source', 'target'],
	(source, target) => {
		return `${source} sniffs ${target}`;
	});

var bark = makeAction('bark',
	['source', 'target'],
	(source, target) => {
		return `${source} barks at ${target}`;
	});





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
		verbs.push('bark', 'growl');
	}

	return verbs;
};

















module.exports = {
	makeAction,
	verbs: actionLookup,
	verbMap,
	getVerbs
};