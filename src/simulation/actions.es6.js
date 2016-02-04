'use strict';

var _ = require('lodash');

var makeAction = (label, requires, fn) => {
	fn.toString = () => label;
	return { label, requires, fn };
};






var sniff = makeAction('sniff',
	['source', 'target'],
	(source, target) => {
		return `${source} sniffs ${target}`;
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
	if (_.includes(source.tags, 'animal'))
	{
		verbs.push('sniff');
	}

	return verbs;
};

















module.exports = {
	verbs: {
		sniff
	},
	verbMap,
	getVerbs
};