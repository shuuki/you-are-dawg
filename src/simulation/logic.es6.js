var flyd = require('flyd');
var $ = require('../core/core.es6');



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
	var sources = flyd.stream({bins: [], intervals: []});
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
	var sources = this.sources();
	interval = isNaN(interval) ? 0 : interval;
	var idx = _.sortedIndex(sources.intervals, interval);
	if (sources.intervals[idx] === interval)
	{
		sources.bins[idx].push(source);
	}
	else
	{
		sources.intervals.splice(idx, 0, interval);
		sources.bins.splice(idx, 0, [source]);
	}
	return this.sources(sources);
};
Logic.prototype.remove = function(source)
{
	var sources = this.sources();
	var toPull = [];
	
	sources.bins.forEach((bin, binIdx) => {
		bin.forEach((source, i) => {
			if (source === bin[binIdx][i])
			{
				if (!toPull[binIdx])
				{
					toPull[binIdx] = [];
				}
				toPull[binIdx].push(i);
			}
		});
	});

	toPull.forEach((idxs, binIdx) =>
		_.pullAt(sources.bins[binIdx], idxs)
	);
	
	return this.sources(sources);	
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
	var sources = this.sources();
	
	sources.intervals.forEach((interval, i) => {
		if ($.intervalCheck(interval, currentTime, delta))
		{
			sources.bins[i].forEach(
				(source) => source(this.land, delta, actors)
			);
		}
	})
};








module.exports = Logic;