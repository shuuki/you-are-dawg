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


var applyMin = $.Vec.ap(Math.min, Math);
var applyMax = $.Vec.ap(Math.max, Math);



























/**
 * The land of the world
 * Probably changing this to an optimized 2D grid
 * Managing information in smart ways through here
 * Going to allow rendering 'slices' out
 * Format probably 2D array of objects of contents. 
 */
var Land = function(rng, config)
{
	this.rng = rng;								// Random source

	// this._dataOffset = [0, 0];		// Offset
	this._data = {};							// Coarse information
	this.keyFn = (pos) => pos.join(',');

	this._actors = [];						// Actors in the world
	this.chunkSize = [25, 25];		// Resolution of land generation
	this.config = config;
};
Land.prototype.add = function(source)
{
	this._actors.push(source);
	return this;
};

Land.prototype.getRect = function(pos, w, h)
{
	// var rect = $.Rect.create(pos, [w, h]);
	// var corners = $.Rect.corners(rect);
	// var chunks = _.uniq(corners.map($.getChunk(this.chunkSize)), _.isEqual);
	
	// // Get the bounds of display, array offset
	// var min = $.getChunk(this.chunkSize,
	// 	corners.reduce((pos, corner) =>
	// 	applyMin(_.zip(pos, corner)), corners[0].slice(0))
	// );
	// var max = $.getChunk(this.chunkSize,
	// 	corners.reduce((pos, corner) =>
	// 	applyMax(_.zip(pos, corner)), corners[0].slice(0))
	// );
	// var numChunks = $.Vec.diff(max, min);

	// var shift = min.map((x) => x > 0 ? x : -x);

	// var chunkToAcc = (chunk) => $.Vec.mult(
	// 	$.Vec.sum(shift, chunk),
	// 	this.chunkSize
	// );

	// // Land for each chunk
	// var land = chunks.reduce((acc, chunk, i) => {
	// 	var key = this.keyFn(chunk);
	// 	var land = this._data[key];
	// 	var chunkRect = $.Rect.create(chunk, this.chunkSize);
		
	// 	if (!land)
	// 	{
	// 		land = this._data[key] = genChunk(this.rng, this.chunkSize[0], this.chunkSize[1]);
	// 	}

	// 	return $.Arr2D.copy(acc, chunkToAcc(chunk), land, $.Rect.create([0, 0], this.chunkSize));
	// }, $.Arr2D.create(this.chunkSize[0] * numChunks[0], this.chunkSize[1] * numChunks[1]));

	// console.log(land);
	
	var key = this.keyFn(pos);
	var land = this._data[key];
	if (!land)
	{
		land = this._data[key] = genChunk(this.rng, w, h);
	}
	land = _.cloneDeep(land);

	var rect = $.Rect.create([0, 0], [w, h]);

	var actors = this._actors.map((actor) => {
		var local = $.toLocal([w, h], pos, actor.pos);
		local[1] = h - local[1] - 1;
		if ($.Rect.contains(rect, local))
		{
			land[local[1]][local[0]] = actor.sprite;
		}

		return actor;
	});

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
	return $.getChunk([this.width, this.height], pos);
};









var Camera = (renderer, config) => {

	var fn = function()
	{
		var renderPoint = renderer.getChunk(this.target.pos);
		return config.source.getRect(renderPoint, renderer.width, renderer.height);
	};

	fn.target = config.target;

	return fn;
}








module.exports = {
	Land,
	Camera,
	Renderer: new Render(30, 30)		 // Singleton render manager?
};