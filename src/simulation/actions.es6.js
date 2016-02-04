'use strict';



var makeAction = (label, requires, fn) => {
	fn.toString = () => label;
	return { label, requires, fn };
};






var sniff = makeAction('sniff', ['source', 'target'],(source, target) => {
	return `${source} sniffs ${target}`;
});






var verbMap = {
	dawg: {
		dawg: ['sniff', 'bark', 'growl', 'check'],
		human: ['sniff'],
		seed: ['sniff']
	}
};

















module.exports = {
	verbs: {
		sniff
	},
	verbMap
};