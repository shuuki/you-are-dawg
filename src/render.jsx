var _ = require('lodash');
var flyd = require('flyd');

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
};





/**
 * Render array of characters into `p` tags
 * @param  {selection} map d3 seleciton to render onto
 * @param  {string[]} land  Each item is a row as a string
 */
var renderMap = (map, land) => {
	var rows = map.selectAll('p').data(land);
	// Render the data as text
	[
		rows,							// d3 update 
	 	rows.enter()			// and endter
			.append('p')
			.classed('glyph', true)
	].forEach((sel) => sel.text((d) => d));
	// Cleanup
	rows.exit().remove();
};




























/**
 * The land of the world
 * Probably changing this to an optimized 2D grid
 * Managing information in smart ways through here
 * Going to allow rendering 'slices' out
 * Format probably 2D array of objects of contents. 
 */
var Land = function(rng, config)
{
	this.rng = rng;
	this._data = [[]];
	this._actors = [];
	this.config = config;
};
Land.prototype.add = function(source)
{
	this._actors.push(source);
	return this;
};
Land.prototype.getRect = function(pos, w, h)
{
	var land = genChunk(this.rng, w, h);
	var rect = $.Rect.create(pos, [w, h]);

	// Push visible actors into tile
	var actors = _.filter(this._actors, (x) => $.Rect.contains(rect, x.pos))
		.map((a) => land[a.pos[0]][a.pos[1]] = a.sprite);
	
	return land;
};













var Render = function(width, height)
{
	var sources = flyd.stream([]);
	/*shrug assign self props?*/
	_.merge(this, { width, height, sources });
};
Render.prototype.title = 'RenderManager';
Render.prototype.add = function(source)
{
	var x = this.sources();
	x.push(source);
	return this.sources(x);
};
Render.prototype.remove = function(source)
{
	var x = this.sources();
	_.pull(x, source);
	return this.sources(x);	
};
Render.prototype.to = function(selection)
{
	// grab sources
	var layers = this.sources().map((x) => x.call(x));

	// Flatten grid via merge and then map empty cells to 'a'
	var land = layers.reduce(_.merge, []).map((row) =>
		row.map((c) => (!c ? 'a' : c))
	).map((row) => row.join(''));

	// Do render
	renderMap(selection, land);

	return this;
};
Render.prototype.getChunk = function(pos)
{
	return [Math.floor(pos[0] / this.width), Math.floor(pos[1] / this.height)];
};
Render.prototype.toLocal = function(chunk, pos)
{
	return [
		pos[0] - chunk[0] * this.width,
		// Invert the y-axis for rendering
		this.height - (pos[1] - chunk[1] * this.height) - 1
	];
};
















module.exports = {
	Land,
	Renderer: new Render(30, 30)		 // Singleton render manager?
};