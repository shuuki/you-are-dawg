'use strict';

var d3 = require('d3');
var ui = require('./debug.jade');
var dagreD3 = require('dagre-d3');
var flyd = require('flyd');

var BehaviourDebugger = function(loadFn, manifest, paused)
{
	var render = new dagreD3.render();

	// Build DOM node from template
	var node = d3.select(document.body)
		.append('div')
		.classed('behaviour debug', true);

	node.html(ui());

	// d3 references to template content
	var svg = node.select('svg.graph');
	var svgGroup = svg.append('g');
	var dotSelect = node.select('.dots');


	// Visible toggle
	var vis = flyd.stream(true);



	// Populate select dropdown
	var dots = ['New Behaviour'].concat(_.keys(manifest));
	var dotsUp = dotSelect.selectAll('option').data(dots);
	dotsUp.enter().append('option');
	dotsUp.text((d) => d);










	// Class node + control game based on visibility
	flyd.on((isVisible) => {
		node.classed('hide', !isVisible);
		paused(isVisible);
	}, vis);


	// UI events
	node.select('.toggle').on('click', () => {
		// Toggle vis stream
		vis(!vis());
	});
};

module.exports = BehaviourDebugger;
