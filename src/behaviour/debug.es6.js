'use strict';

var d3 = require('d3');
var ui = require('./debug.jade');
var dagreD3 = require('dagre-d3');
var flyd = require('flyd');

var BehaviourDebugger = function(loadFn, manifest, paused)
{
	var render = new dagreD3.render();
	var node = d3.select(document.body)
		.append('div')
		.classed('behaviour debug', true);

	// Render structure
	node.html(ui());

	// Build dag SVG
	var svg = node.select('svg.graph');
	var svgGroup = svg.append('g');

	// Visible toggle
	var vis = flyd.stream(false);

	flyd.on((isVisible) => {
		node.classed('hide', !isVisible);
		paused(isVisible);
	}, vis);

	node.select('.toggle').on('click', () => {
		// Toggle vis stream
		vis(!vis());
	});

	// @todo: move to menu
	loadFn('human').then(
		(res) => {
			console.log(res);
			return render(svgGroup, res);
		}
	);
};

module.exports = BehaviourDebugger;
