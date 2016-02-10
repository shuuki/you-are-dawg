var _ = require('lodash');

// Some maths
var sum = (a, b) => a+b; var ssum = _.spread(sum); // Spread something?
var diff = (a, b) => a-b; var sdiff = _.spread(diff);
var mult = (a, b) => a*b; var smult = _.spread(mult);
var square = (a) => a*a;
var div = (a, b) => a/b; var sdiv = _.spread(div);
var dist = (a, b) => Math.sqrt(
	square(diff(a[0], b[0])) +
	square(diff(a[1], b[1]))
);

var _pCache = [];
var permutations = (emptyVal, arr) => {
	var pMap = _pCache[arr.length];
	if (!pMap)
	{
		pMap = _.map(new Array(arr.length * arr.length), (x, i) => {
			var settings = i.toString(2).split('');
			if (settings.length < arr.length)
			{
				var prepend = _.fill(new Array(arr.length - settings.length), emptyVal);
				settings.splice.apply(settings, [0, 0].concat(prepend));
			}
			return settings;
		});
	}

	return pMap.map((permutation) => {
		return arr.map((x, i) => (+permutation[i]) ? x : emptyVal);
	});
};


/**
 * Vector interface.
 * Assumes you call fns with same length vectors.
 * @type {Object}
 */
var Vec = {
	eq: _.curry((a, b) => _.every(a, (x, i) => a[i] === b[i]), 2),
	diff: _.curry((src, by) => _.zip(src, by).map(sdiff), 2),
	div: _.curry((src, by) => _.zip(src, by).map(sdiv), 2),
	mult: _.curry((src, by) => _.zip(src, by).map(smult), 2),
	sum: _.curry((src, by) => _.zip(src, by).map(ssum), 2),
	ap: _.curry((fn, self, arr) => arr.map((x) => fn.apply(self, x)), 3)
};



var Rect = {
	create: (dims, pos) => { return {pos, dims}; },
	contains: (rect, pt) => _.every(pt, (d, i) =>
		d >= rect.pos[i] &&
		d < rect.pos[i] + rect.dims[i]
	),
	corners: (rect) => permutations(0, rect.dims).map(Vec.sum(rect.pos))
};





var Arr2D = {
	create: (w, h) => _.map(new Array(w), (x) => new Array(h)),
	fill: (arr, val) => _.map(arr, (row) =>
		_.map(row, (c) => _.isFunction(val) ? val() : val)),
	extract: _.curry((arr, w, h, x, y) => {
		x = Math.min(Math.max(x, 0), arr.length);
		w = x + w > arr.length ? arr.length - x : w;
		y = Math.min(Math.max(y, 0), arr[0].length);
		h = y + h > arr[0].length ? arr[0].length - y : h;
		return _.map(new Array(w), (row, a) => {
			return _.map(new Array(h), (cell, b) => {
				return arr[x + a][y + b];
			});
		});
	}, 5),
	copy: (dest, destPos, source, sourceRect) => {
		var toPaste = Arr2D.extract(source, sourceRect.dims[0], sourceRect.dims[1], sourceRect.pos[0], sourceRect.pos[1]);
		
		_.forEach(toPaste, (row, i) => {
			_.forEach(row, (val, j) => {
				dest[destPos[0] + i][destPos[1] + j] = val;
			});
		});

		return dest;
	}
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
},4);
var correlator = (labels, weights, seed) => labels[_.findIndex(weights, (w) => seed <= w)];




// Nifty things
var get = _.curry((prop, obj) => _.get(obj, prop), 2);

var pickFilter = _.curry((pick, filter, collection) =>
	_(collection)
		.pick(pick)
		.pairs()
		.filter(filter)
		.map('0')
		.value(),
3); // curried

var neq = _.curry((a, b) => a !== b, 2);
var inMap = _.curry((map, data) => map[data] !== undefined);



var getChunk = _.curry((dims, pos) =>
	Vec.div(pos, dims)
		.map(Math.floor),
2);

var toLocal = _.curry((dims, chunk, pos) => {
	var out = Vec.diff(pos, Vec.mult(chunk, dims));
	// flip y axis to make life easy @todo elsewhere
	out[1] = dims[1] - out[1] - 1;
	return out;
}, 3);

var localToWorld = _.curry((dims, chunk, pos) => 
	Vec.sum(
		pos, Vec.mult(dims, chunk)
	)
, 3)



// Curry stuff
sum = _.curry(sum, 2);
mult = _.curry(mult, 2);
div = _.curry(div, 2);
diff = _.curry(diff, 2);
dist = _.curry(dist, 2);



/**
 * Boolean to fire event if interval has passed
 * in time / delta
 * @param  {Number}
 * @param  {Number}
 * @param  {Number}
 * @return {Boolean}
 */
var intervalCheck = (interval, time, delta) =>
		// We hit the interval
		time % interval === 0
		// The delta was bigger than our interval
		|| delta > interval
		// Or we jumped over the check
		|| (time % interval) > ((time + delta) % interval);


/**
 * Finds bin that search falls into and returns value
 * @param  {String} binPath - path to get the bin's max value
 * @param  {String} valuePath - path of value to return
 * @param  {[type]}
 * @return {[type]}
 */
var getBin = (binPath, valuePath, bins, search) => {
	var out;
	// lodash forEach for early out
	_.forEach(bins, (bin, i) => {
		if (_.get(bin, binPath) >= search)
		{
			out = valuePath ? _.get(bin, valuePath) : bin;
			return false;
		}
	});

	return out;
};


var core = {
	// Maths
	sum, diff, square, dist, mult, div,
	// Extraction
	correlatum, correlator, pickFilter, getBin,
	// Geometry?
	getChunk, toLocal, localToWorld,
	// @todo: Rectangle
	Vec, Rect,
	// Data
	Arr2D, get: get, inMap,
	// Boolean logic
	neq,
	// Utility
	intervalCheck
};

module.exports = _.merge(core, require('./rand.es6'));