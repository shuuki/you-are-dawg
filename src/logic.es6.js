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
 * Add a logic function to run.
 * Runs at next update, then at each `interval` millis.
 * @param {[type]} source   [description]
 * @param {[type]} interval [description]
 */
Logic.prototype.add = function(source, interval)
{
	interval = isNaN(interval) ? 0 : interval;
	
	var x = this.sources();
	x.push([source, interval, 0]);
	return this.sources(x);
};
Logic.prototype.remove = function(source)
{
	var x = this.sources();
	x.splice(_.findIndex(x, (a) => a[0] === source), 1);
	return this.sources(x);	
};
Logic.prototype.step = function(delta)
{
	// @todo: better than this
	var lastLand = this.land._cache;
	var actors = _.flatten(_.map(_.flatten(lastLand.land), 'actors'));
	
	// @todo: Should sort by time after diff -- some things can jump in the future
	// @todo: better datastructure for time remaining buckets
	this.sources().forEach((source) => {
		source[2] = source[2] - delta;
		if (source[2] <= 0)
		{
			source[0](lastLand, delta, actors);
			source[2] = source[1];
		}
	});
};








module.exports = Logic;