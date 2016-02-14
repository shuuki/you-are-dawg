var dot = require('graphlib-dot');

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
	human: require('raw!./human.dot'),
	squirrel: require('raw!./squirrel.dot')
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
		cache[name] = load(behaviors[name]);
	}

	return cache[name];
};







// Debug
var BehaviourDebugger = require('./debug.es6');
new BehaviourDebugger(loadBehaviour, behaviors);









module.exports = {
	behaviors,
	// Promisified loader
	load: loadBehaviour
};
