'use strict';

// a('seed', '`', ['plant']),
// a('sprout', '`', ['plant']),
// a('sapling', ',', ['plant']), 
// a('aspen', 'H', ['plant']), 
// a('spruce', 'A', ['plant']),
// a('pine', 'T', ['plant']),

var evolution = {
	seed: {
		entropy: 100,
		next: ['sprout']
	},
	sprout: {
		entropy: 100,
		next: ['sapling']
	},
	sapling: {
		entropy: 100,
		next: ['aspen', 'spruce', 'pine']
	}
};

module.exports = {
	evolution
};