'use strict';

var d3 = require('d3');
var ui = require('./debug.jade');
var dagreD3 = require('dagre-d3');

var node = d3.select(document.body)
	.append('div')
	.classed('behaviour debug', true);

node.html(ui());
var svg = node.select('svg.graph');
var svgGroup = svg.append('g');

var vis = {
	_vis: false,
	visible: (set) => set === undefined ? vis._vis : vis._vis = set
};
node.select('.toggle').on('click', () => {
	//set it to invisible, then check the value
	node.classed('hide', vis.visible(!vis.visible()));
});

var render = new dagreD3.render();
var BehaviourDebugger = function(loadFn, manifest)
{
	console.log(loadFn);
	loadFn('human').then(
		(res) => {
			console.log(res);
			return render(svgGroup, res);
		}
	);
};

module.exports = BehaviourDebugger;
