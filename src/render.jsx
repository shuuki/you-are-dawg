var _ = require('lodash');
var flyd = require('flyd');
var d3 = require('d3');

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




// Actual function because this
var basicRender = function(data, index) {
	var sprites = _.reduce(data, (acc, layer) => {
		acc.push(layer.land);
		acc.push.apply(acc, _.pluck(layer.actors, 'sprite'));
		return acc;
	}, []);

	var spans = d3.select(this).select('div').selectAll('span').data(sprites);
	var e = spans.enter().append('span');
	spans.text((d) => d);
	
	spans.exit().remove();
};







/**
 * Render array of characters into `p` tags
 * @param  {selection} map d3 seleciton to render onto
 * @param  {string[]} land  Each item is a row as a string
 */
var renderMap = (map, land) => {
	var tr = map.classed('glyph', true).selectAll('tr').data(land);
	var tr_e = tr.enter().append('tr');
	tr.exit().remove();

	var td = tr.selectAll('td').data((d) => d);
	var td_e = td.enter().append('td').append('div');
	[td, td_e].forEach((sel) => {
		sel.each(basicRender);
	});

	td.exit().remove();
};


var applyMin = $.Vec.ap(Math.min, Math);
var applyMax = $.Vec.ap(Math.max, Math);





















/**
 * @typedef {object} Source
 * @method getRect
 *  @param {[number, number]} pos Tuple of numbers for (x, y)
 *  @param {number} w width of rect
 *  @param {number} h height of rect
 *  @returns {object[][]} Rectangle of cells of objects
 */





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

	this._cache = [[]]; // Last getRect result
};
Land.prototype.add = function(source)
{
	// @todo: Easy optimization if actors is slow -> sort by dawg pos
	this._actors.push(source);
	return this;
};
Land.prototype.getRect = function(pos, w, h)
{
	// Grab current land (string[][])
	var key = this.keyFn(pos);
	var land = this._data[key];
	if (!land)
	{
		land = this._data[key] = genChunk(this.rng, w, h);
	}

	// Transform the land from string[][] to
	// (string[][]) -> {land: {cell: string}, actors}[][]
	land = _.map(land, (rows) => rows.map((cell) => {
		return { land: cell, actors: [] };
	}));

	var rect = $.Rect.create([0, 0], [w, h]);
	this._actors.forEach((actor) => {
		var local = $.toLocal([w, h], pos, actor.pos);
		local[1] = h - local[1] - 1;
		
		if ($.Rect.contains(rect, local))
		{
			land[local[1]][local[0]].actors.push(actor);
		}
	});

	// Update cache to new land
	this._cache = land;
	return land;
};




// idea
// we leave Land dedicated to managing the terrain
// For the game world, we can have "Logic" blocks
// Logic is represented by a function which gets every object
// of a cell, is allowed to transform it, and must return it
// 
// @see: logic.jsx
//  so,
//  Logic.fn : (Cell) -> Cell
//  
//  they're run in order of added for sanity sake





























var Render = function(width, height, renderFn)
{
	var sources = flyd.stream([]);
	
	// Defaults
	renderFn = renderFn || renderMap;

	/*shrug assign self props?*/
	_.merge(this, { width, height, sources, renderFn });
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
	var land = $.Arr2D.fill(
		$.Arr2D.create(this.width, this.height),
		() => []
	);

	// Flatten grid via merge and then map empty cells to 'a'
	var layers = this.sources().map((x) => x.call(x));
	for (var i = 0; i < layers.length; i++)
	{
		for (var c = 0; c < layers[i].length; c++)
		{
			for (var r = 0; r < layers[i][c].length; r++)
			{
				if (layers[i][c][r])
				{
					land[c][r].push(layers[i][c][r]);
				}
			}
		}
	}

	// Do render
	this.renderFn(selection, land);

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








// var Minimap = ()








module.exports = {
	Land,
	Camera,
	Renderer: new Render(30, 30),		 // Singleton render manager?
	Minimap: new Render(200, 200, renderMap) // Are the pieces coming together already?
};