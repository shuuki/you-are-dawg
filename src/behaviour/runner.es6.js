'use strict';

var _ = require('lodash/fp');
var factory = require('./factory.es6');
var jsep = require('jsep');

var BehaviourRunner = function()
{
	//@todo: bind behaviour graphs
	//@todo: parse dot into ast
	//@todo: bind ast exec
	//@todo: execute ast
};

// @todo: figure out how to register behavious? Exceute them? Etc?
BehaviourRunner.prototype.run = function(land, delta)
{
	var squirrels = _.filter({ name: 'squirrel' }, land._actors);
	var res = factory.load('squirrel')();
	if (_.get('graph', res))
	{
		var g = res.graph;
		var clusters = _.fromPairs(
				g.children()
				.filter((x) => x.startsWith('cluster'))
				.map((x) => {
					return [x, g.children(x).map((n) => {
						return { name: n, data: g.node(n) };
					})];
				})
			);

		var exec = (actor, cluster) => {
			console.log(actor.status, cluster);
			try {
				var n = cluster[0]; // @todo: state root
				var tree = jsep(n.data.label);
				console.log(tree);
			}
			catch (error) {
				console.log(error);
			}
		};

		squirrels.forEach((actor) => {
			var state = _.get('cluster' + actor.state, clusters);
			if (state)
			{
				exec(actor, state);
			}
		});
	}
};



module.exports = BehaviourRunner;
