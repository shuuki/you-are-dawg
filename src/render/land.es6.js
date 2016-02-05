'use strict';

var _ = require('lodash');
var $ = require('../core/core.es6');
var verse = require('../data/data.es6');


//////////
// Different ways to render the game world.
//////////
var genChunk = (rng, dims) => {
	return _.chunk($.correlatum(
		rng, dims[0] * dims[1],
		_.map(verse.land, "sprite"),
		_.map(verse.land, "chance")
	), dims[0]);
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

	this.dims = [20, 20]; // Default to 20x20
	this._cache = {pos: [0, 0], dims: this.dims, land: [[]]}; // Last getRect result

	// set config
	_.merge(this, config);
};
Land.prototype.add = function(source)
{
	// @todo: Easy optimization if actors is slow -> sort by dawg pos
	this._actors.push(source);
	return this;
};
Land.prototype.remove = function(source)
{
	_.remove(this._actors, source);
	return this;
};
Land.prototype.lastRect = function()
{
	return this._cache;
};
Land.prototype.at = function(pos)
{
	var chunk = $.getChunk(this.dims, pos);
	var key = this.keyFn(chunk);
	var local = $.toLocal(this.dims, chunk, pos);
	var terrain = this._data[key];
	if (!terrain)
	{
		terrain = this._data[key] = genChunk(this.rng, this.dims);
	}
	var land = {
		land: this._data[key][local[1]][local[0]],
		actors: []
	};
	var atTestPt = $.Vec.eq(pos);
	this._actors.forEach((actor) => {
		if (atTestPt(actor.pos))
		{
			land.actors.push(actor);
		}
	});

	return land;
};
Land.prototype.getRect = function(dims, pos)
{
	// Grab current land (string[][])
	var key = this.keyFn(pos);
	var land = this._data[key];
	if (!land)
	{
		land = this._data[key] = genChunk(this.rng, dims);
	}

	// Transform the land from string[][] to
	// (string[][]) -> {land: {cell: string}, actors}[][]
	land = _.map(land, (rows) => rows.map((cell) => {
		return { land: cell, actors: [] };
	}));

	var rect = $.Rect.create(dims, [0, 0]);
	this._actors.forEach((actor) => {
		var local = $.toLocal(dims, pos, actor.pos);
		
		if ($.Rect.contains(rect, local))
		{
			land[local[1]][local[0]].actors.push(actor);
		}
	});

	// Update cache to new land
	this._cache = { pos, dims, land };
	return land;
};

module.exports = Land