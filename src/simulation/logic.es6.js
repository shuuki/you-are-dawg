var flyd = require('flyd');




/**
 * Logic manager. Used to map cells.
 *
 * Logic sources execute based on a time interval.
 *
 * They are checked and traversed in order of added.
 *
 * @param {Source} land Source object. @see: Land in render.jsx
 */
var Logic = function(land)
{
	var sources = flyd.stream([]);
	/*shrug assign self props?*/
	_.merge(this, { land, sources });
};

Logic.prototype.title = 'LogicManager';

/**
 * @param  {Object[][]} landChunk - grid of cells
 * @param  {Number} delta - time delta
 * @param  {Actor[]} - Actors in the chunk
 * @param  {Land} - Land source of lastLand
 * @return {void}
 */

/**
 * Add a logic function to run.
 * Runs at next update, then at each `interval` millis.
 * Functions at the same interval run in order of added.
 * @param {LogicFn} source   [description]
 * @param {[type]} interval [description]
 */
Logic.prototype.add = function(source, interval)
{
	interval = isNaN(interval) ? 0 : interval;
	
	var x = this.sources();
	x.push([source, interval]);
	return this.sources(x);
};
Logic.prototype.remove = function(source)
{
	var x = this.sources();
	x.splice(_.findIndex(x, (a) => a[0] === source), 1);
	return this.sources(x);	
};
Logic.prototype.step = function(delta, currentTime)
{
	// @todo: better than this
	var actors = _.sortBy(
		_.flatten(
			_.map(_.flatten(this.land.lastLand().land), 'actors')
		), 'id');
	
	// @todo: Should sort by time after diff -- some things can jump in the future
	// @todo: better datastructure for time remaining buckets
	this.sources().forEach((source) => {
			// We hit the interval
		var inInterval = currentTime % source[1] === 0
			// The delta was bigger than our interval
			|| delta > source[1]
			// Or we jumped over the check
			|| ((currentTime % source[1]) > ((currentTime + delta) % source[1]));
		if (inInterval){
			source[0](this.land, delta, actors);
		}
	});
};








module.exports = Logic;