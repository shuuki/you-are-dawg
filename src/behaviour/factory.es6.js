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







var load = (src) => {
	return new Promise((resolve, reject) => {
		resolve(dot.read(src));
	});
};






var cache = {};
var loadBehaviour = (name) => {
	if (!cache[name])
	{
		cache[name] = load(behaviors[name]).then(
			(graph) => {
				return {
					graph,
					name,
					source: behaviors[name]
				};
			},
			(err) => new Error(`Could not load "${name}"`));
	}

	return cache[name];
};









module.exports = (paused) => {
	// Debug
	new BehaviourDebugger(loadBehaviour, behaviors, paused);


	return {
		behaviors,
		// Promisified loader
		load: loadBehaviour
	};
}
