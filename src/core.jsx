var _ = require('lodash');

// Some maths
var sum = (a, b) => a+b; var ssum = _.spread(sum); // Spread something?
var diff = (a, b) => a-b;
var mult = (a, b) => a*b;
var square = (a) => a*a;
var div = (a, b) => a/b;
var dist = (a, b) => Math.sqrt(
	square(diff(a[0], b[0])) +
	square(diff(a[1], b[1]))
);


/**
 * Vector interface.
 * Assumes you call fns with same length vectors.
 * @type {Object}
 */
var Vec = {
	move: (src, by) => _.zip(src, by).map(ssum)
};



var Rect = {
	create: (pos, dims) => { return {pos, dims}; },
	contains: (rect, pt) => _.every(pt, (d, i) =>
		d <= rect.pos[i] + rect.dims[i]
	)
};





var Arr2D = {
	create: (w, h) => _.map(new Array(w), (x) => new Array(h)),
	fill: (arr, val) => _.map(arr, (row) => _.fill(row, val)),
	extract: _.curry((arr, w, h, x, y) => {
		x = Math.max(Math.min(x, 0), arr.length);
		w = x + w > arr.length ? arr.length - x : w;
		y = Math.max(Math.min(y, 0), arr[0].length);
		h = y + h > arr[0].length ? arr[0].length - y : h;
		return _.map(new Array(w), (row, a) => {
			return _.map(new Array(h), (cell, b) => {
				return arr[x + a][y + b];
			});
		});
	}, 5)
};











/**
 * Takes 2 arrays aligned by index of labels and their weights.
 * @param {() -> number} rng - f -> [0,1) 
 * @param {number} count - How many items to get
 * @param {string[]} label - List of labels
 * @param {number[]} bounds - Weight of each label
 * @return {string[]} - List of `label` items `count` long.
 */
var correlatum = _.curry((rng, count, label, bounds) => {
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
}, 4);
var correlator = (labels, weights, seed) => labels[_.findIndex(weights, (w) => seed <= w)];




// Nifty things
var get = _.curry((prop, obj) => _.get(obj, prop), 2);

var pickFilter = _.curry((pick, filter, collection) =>
	_(collection)
		.pick(pick)
		.pairs()
		.filter(filter)
		.pluck(0)
		.value(),
3); // curried

var neq = _.curry((a, b) => a !== b, 2);

var inMap = _.curry((map, data) => map[data] !== undefined);

// Curry stuff
sum = _.curry(sum, 2);
mult = _.curry(mult, 2);
div = _.curry(div, 2);
diff = _.curry(diff, 2);
dist = _.curry(dist, 2);







module.exports = {
	// Maths
	sum, diff, square, dist, mult, div,
	// Extraction
	correlatum, correlator, pickFilter,
	// Geometry?
	// @todo: Rectangle
	Vec, Rect,
	// Data
	Arr2D, get: get, inMap,
	// Boolean logic
	neq
};