var $ = require('./core.jsx');
var verse = require('./data.jsx');

// Render a button row (?)
// var btnRow = gameNode.append('div').classed('flex-row', true);
// var buttons = btnRow.append('div').classed('buttons', true);
// var controls = ['North', 'South', 'East', 'West'];
// var clicks = flyd.stream();
// var up = buttons.selectAll('button').data(controls);
// [up, up.enter().append('button')].forEach((group => {
// 	group.on('click', clicks);
// 	group.text((d) => d);
// }));



//////////
// Different ways to render the game world.
//////////
var genChunk = (rng, rows, cols) => {
	return _.chunk($.correlatum(
		rng, rows * cols,
		_.pluck(verse.land, "sprite"),
		_.pluck(verse.land, "chance")
	), cols);
}






/**
 * The land of the world
 * Probably changing this to an optimized 2D grid
 * Managing information in smart ways through here
 * Going to allow rendering 'slices' out
 * Format probably 2D array of objects of contents. 
 */
var Land = function(rng, config){
	this.rng = rng;
	this._data = [[]];
	this.config = config;
};

Land.prototype.keyFn = function(a, b){ return a + ',' + b; };

Land.prototype.at = function(a, b){
	var key = this.keyFn(a, b);
	if (!this._data[key]) {
		this._data[key] = genChunk(this.rng, this.config.w, this.config.h);
	};
	return this._data[key];
};



module.exports = {
	Land
};