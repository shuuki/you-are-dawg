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
var exampleDot = require('./example.dot');
var manifest = require('./manifest');
var overrides = {};
var compiled = {};






var load = (name) => {
	if (compiled[name])
	{
		return compiled[name];
	}
	else
	{
		var source = _.get(overrides, name,
			_.get(manifest, name, exampleDot));
		
		var cleanSource = source.split('\n')
			.map((x) => x.trim())
			.join('\n');

		var loadPromise = new Promise((resolve, reject) => {
			resolve(dot.read(cleanSource));
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
	overrides[name] = source;
	delete compiled[name];
	return load(name);
};
var removeOverride = (name) => {
	delete overrides[name];
	delete compiled[name];
	return load(name);
};







module.exports = {
	manifest,
	load,
	override,
	removeOverride
};
