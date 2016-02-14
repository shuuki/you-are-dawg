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

	// Local ui bindings
	var dotSelect = node.select('.dots');
	var svg = node.select('svg.graph');
	var dagGroup = svg.append('g');

	var zoom = d3.behavior.zoom().on("zoom", () => {
		dagGroup.attr('transform',
			`translate(${d3.event.translate}) `
			+ `scale(${d3.event.scale})`);
	});
	svg.call(zoom);

	// Visible toggle
	var vis = flyd.stream(true);
	var selectedDot = flyd.stream();
	var loadedDot = selectedDot.map(loadFn);

	// Bind locals to controller
	this.node = node;
	this.render = render;
	this.vis = vis;
	this.svg = svg;
	this.dagGroup = dagGroup;
	this.dotSelect = dotSelect;
	this.selectedDot = selectedDot;
	this.sourceText = node.select('textarea.source');
	this.outputText = node.select('textarea.output');

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

	var updateSelection = (selectSource) => {
		var option = _.first(selectSource.selectedOptions);
		
		if (option)
		{
			selectedDot(d3.select(option).datum());
		}
	};

	dotSelect.on('change', () => {
		updateSelection(dotSelect.node());
	});

	this.sourceText.on('input', () => {
		console.log('!!');
	});

		// Populate select dropdown
	this.updateBehavious(manifest);
	updateSelection(dotSelect.node());

	flyd.on((res) => this.displayLoad(res), loadedDot);
};

BehaviourDebugger.prototype.renderBehaviour = function(behaviour)
{
	try
	{
		this.render(this.dagGroup, behaviour.graph);
		this.outputText.node().value = 'No render errors.';
	}
	catch (error)
	{
		this.dagGroup.select('g').remove();
		this.outputText.node().value = error.stack.toString();
	}
};

BehaviourDebugger.prototype.displayLoad = function(res)
{
	if (res instanceof Error)
	{
		this.sourceText.node().value = res.message;
		this.outputText.node().value = '';
	}
	else
	{
		this.sourceText.node().value = res.source;
		this.renderBehaviour(res);
	}
};

BehaviourDebugger.prototype.updateBehavious = function(manifest)
{
	var dots = ['New Behaviour'].concat(_.keys(manifest));
	var dotsUp = this.dotSelect.selectAll('option').data(dots);
	dotsUp.enter().append('option');
	dotsUp.text((d) => d);
};

module.exports = BehaviourDebugger;
