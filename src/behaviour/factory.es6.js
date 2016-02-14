var dot = require('graphlib-dot');
var BehaviourDebugger = require('./debug.es6');

// All the docs -- first the language, then the libs using 'em
// @see https://en.wikipedia.org/wiki/DOT_(graph_description_language)
// @see http://www.graphviz.org/content/dot-language
// @see http://www.graphviz.org/Documentation/dotguide.pdf
// @see https://github.com/cpettitt/graphlib/wiki/API-Reference#serialization
// @see https://github.com/cpettitt/graphlib-dot/wiki



// Manifest of local dot files
// @todo: generate this based on files
// @see: https://webpack.github.io/docs/context.html
var behaviors = {
	human: require('./human.dot'),
	squirrel: require('./squirrel.dot'),
	example: require('./example.dot')
};
var overrides = {};
var compiled = {};






var load = (name) => {
	if (compiled[name])
	{
		return compiled[name];
	}
	else
	{
		var source = overrides[name] || behaviors[name];
		var loadPromise = new Promise((resolve, reject) => {
			resolve(dot.read(source));
		}).then(
			(graph) => {
				compiled[name] = loadPromise;
				return { graph, name, source };
			},
			(error) => {
				delete compiled[name];
				return { error, name, source };
			}
		);

		return loadPromise;
	}
};
var override = (name, source) => {
	override[name] = source;
	delete compiled[name];
	return load(name);
};
var removeOverride = (name) => {
	delete override[name];
	delete compiled[name];
	return load(name);
};







var factoryAPI = {
	behaviors,
	load,
	override,
	removeOverride
};

// This is janky here like this
module.exports = (paused) => {
	// Debug
	new BehaviourDebugger(factoryAPI, behaviors, paused);

	// And the API
	return factoryAPI;
}
