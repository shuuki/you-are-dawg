var _ = require('lodash');
var flyd = require('flyd');
var d3 = require('d3');

var $ = require('../core/core.es6');

//  helper  to do a basic datajoin
var joinElt = _.curry((elt, selection, data, keyFn) => {
	var update = selection.selectAll(elt).data(data, keyFn);
	update.text((d) => d); // Update
	update.enter().append(elt).text((d) => d); // Enter
	update.exit().remove(); // Exit
	return update;
}, 3);




// Actual function because this
var basicRender = function(data, index) {
	var sprites = _.reduce(data, (acc, layer) => {
		acc.push({sprite: layer.land, name: 'land'});
		acc.push.apply(acc, layer.actors);
		return acc;
	}, []);

	// d3.select(this).select('div').attr('class', (d) => d[0].actors.reduce((acc, actor) => {
	// 	acc.push(actor.name);
	// 	return acc;
	// }, []));

	var spans = d3.select(this).select('div').selectAll('span').data(sprites);
	var e = spans.enter().append('span');
	spans.attr('class', (d) => d.name);
	spans.text((d) => d.sprite);
	
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




























var Render = function(renderFn, config)
{
	var sources = flyd.stream([]);

	// Defaults
	renderFn = renderFn || renderMap;

	/*shrug assign self props?*/
	_.merge(this, config);
	_.merge(this, { sources, renderFn });
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
		$.Arr2D.create(this.dims[0], this.dims[1]),
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
	return $.getChunk(this.dims, pos);
};









var Camera = (renderer, config) => {

	var fn = function()
	{
		var renderPoint = renderer.getChunk(this.target.pos);
		return config.source.getRect(renderer.dims, renderPoint);
	};

	fn.target = config.target;

	return fn;
}








// var Minimap = ()



// @todo: better data join than innerHTML set
var renderJade = _.curry(
	(template, selection, data) => 
		selection.node().innerHTML = template(data),
	3);







module.exports = {
	joinElt,
	Camera,
	jade: renderJade,
	Renderer: new Render(),	
	Minimap: new Render() // Are the pieces coming together already?
};