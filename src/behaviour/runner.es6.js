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
	var compile = (s) => flyd.map((res) => {
		try {
			return _.fromPairs(
			res.graph.nodes()
				.filter(isCluster)
				.map((x) => [x, topo(res.graph, res.graph.children(x)[0])]))
		}
		catch (error)
		{
			console.log(error);
			return error;
		}
	}, filterErrors(s));

	// Compile behaviour trees
	this.behaviours = {
		squirrel: compile(factory.load('squirrel'))
	};
};

var runFn = (exp, src, actor, locals, flowAction) => {
	switch (exp.callee.name) {
		case 'flow':
			// console.log('flow', src, actor, locals);
			return flowAction(exp.arguments[0].value, locals);
			break;
		case 'if':
			src = `return ${src.replace('if', '!!')}`;
			break
;	}
	return Function(src).call(actor, locals);
}

// @todo: figure out how to register behavious? Exceute them? Etc?
BehaviourRunner.prototype.run = function(land, delta, flowAction)
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
						return exp.name;
					case 'CallExpression':
						var res = runFn(exp, stack[1], actor, { land, delta, source: actor }, flowAction);
						var next;
						if (stack[2])
						{
							if (res)
							{
								next = stack[2].filter(_.matches([res.toString()]))[0];
							}
							else
							{
								// Random edge choice
								next = _.sample(stack[2]);
							}
						}

						if (next)
						{
							return step(next[1]);
						}
						break;
				}

				// console.log('Oh no!!', stack);
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
			if (_.isString(result))
			{
				actor.state = result;
			}
		}
	});
};



module.exports = BehaviourRunner;
