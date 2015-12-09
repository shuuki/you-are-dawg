var flyd = require('flyd');

// Some maths
var sum = (a, b) => a+b;
var diff = (a, b) => a-b;
var square = (a) => a*a;
var dist = (a, b) => Math.sqrt(
	square(diff(a[0], b[0])) +
	square(diff(a[1], b[1]))
);














/**
 * Takes 2 arrays aligned by index of labels and their weights.
 * @param {() -> number} rng - f -> [0,1) 
 * @param {number} count - How many items to get
 * @param {string[]} label - List of labels
 * @param {number[]} bounds - Weight of each label
 * @return {string[]} - List of `label` items `count` long.
 */
var correlatum = flyd.curryN(4, (rng, count, label, bounds) => {
	var totalWeight = _.reduce(bounds, sum);

	return _.map(new Array(count), () => {
		var roll = rng() * totalWeight;
		var out;
		_.forEach(bounds, (bound, i) => {
			roll -= bound;
			if (roll <= 0) {
				out = label[i];
				return false; // Secret lodash early out!
			}
		});
		return out;
	});
});
var correlator = (labels, weights, seed) => 
	_.first(correlatum(
		() => seed / _.reduce(weights, sum),	// Produces exactly that bin
		1,
		labels,
		weights
	));








module.exports = {
	// Maths
	sum, diff, square, dist,
	// Randoms
	correlatum, correlator
};