'use strict';

var _ = require('lodash');
var $ = require('./core.es6');

/**
 * Sets the path to the result of a function, passing in the current value.
 * Example (assume curried functions):
 * 
 * sum = (a, b) => a + b
 * obj = { hp: 0 };
 * var gain5HP = mod(sum(5), 'hp');
 * 
 * // obj.hp === 0
 * gain5HP(obj); // Returns 5 (result of the set operation)
 * // obj.hp === 5
 *
 * 
 * @param  {function(a) -> b} A funciton that will be passed source[path]
 * @return {b} result of running fn on source[path]
 */
var mod = _.curry((fn, path, source) => {
	_.set(path, source, fn(_.get(path, source)));
	return _.get(path, source);
}, 3);



// I guess I'll toss some useful partials here
var backAway = _.curry((distance, source, target) => {
	// var direction = $.Vec()
});




module.exports = {
	mod,
	backAway
};