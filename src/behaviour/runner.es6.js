'use strict';

var _ = require('lodash/fp');
var factory = require('./factory.es6');
var jsep = require('jsep');
var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');

// Topo sort a tree
var topo = (graph, root) => {
	var visited = {};

	return (function visit(node)
	{
		return [
			node,
			graph.node(node).label,		// @todo: can nodes have more data?
			graph.outEdges(node).map((e) => {
				var edge = graph.edge(e.v, e.w);

				if (visited[e.w])
				{
					throw new Error({ message: 'cycle found', node, edge, e, visited });
				}

				visited[e.w] = true;

				return [edge.label, visit(e.w)];
			})
		];
	})(root);
};

var BehaviourRunner = function()
{
	//@todo: bind behaviour graphs
	//@todo: parse dot into ast
	//@todo: bind ast exec
	//@todo: execute ast
	var isCluster = (x) => x.startsWith('cluster');
	var filterErrors = flyd.filter((x) => !x.error);
	var compile = (s) => flyd.map((res) => _.fromPairs(
		res.graph.nodes()
			.filter(isCluster)
			.map((x) => [x, topo(res.graph, res.graph.children(x)[0])]))
		, filterErrors(s));

	// Compile behaviour trees
	this.behaviours = {
		squirrel: compile(factory.load('squirrel'))
	};
};

var runFn = (name, src, actor) => {
	switch (name) {
		case 'if':
			src = src.replace('if', '!!');
			break;
	}
	return Function(`return ${src}`).call(actor)
}

// @todo: figure out how to register behavious? Exceute them? Etc?
BehaviourRunner.prototype.run = function(land, delta)
{
	var squirrels = _.filter({ name: 'squirrel' }, land._actors);
	var states = this.behaviours['squirrel']();

	// Exec a node
	var exec = (actor, tree) => {
		try {
			return (function step(stack)
			{
				var exp = jsep(stack[1]);
				switch (exp.type)
				{
					case 'Identifier':
						// String result is a state change!
						return exp.name;
					case 'CallExpression':
						var res = runFn(exp.callee.name, stack[1], actor);
						var next = stack[2].filter(_.matches([res.toString()]))[0];
						if (next)
						{
							return step(next[1]);
						}
						break;
				}

				console.log('Oh no!!', stack);
			})(tree);
		}
		catch (error) {
			console.log(error);
		}
	};

	squirrels.forEach((actor) => {
		var state = _.get('cluster' + actor.state, states);
		if (state)
		{
			var result = exec(actor, state);
			// actor.state = result;
		}
	});
};



module.exports = BehaviourRunner;
