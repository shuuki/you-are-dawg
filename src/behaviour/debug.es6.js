'use strict';

var d3 = require('d3');
var ui = require('./debug.jade');

var node = d3.select(document.body)
	.append('div')
	.classed('behaviour debug', true);

node.html(ui());

console.log(node);


var BehaviourDebugger = function(loader, manifest)
{
	console.log('behaviour', manifest);

};

module.exports = BehaviourDebugger;
