var _ = require('lodash/fp');
var dot = require('graphlib-dot');
var flyd = require('flyd');

// All the docs -- first the language, then the libs using 'em
// @see https://en.wikipedia.org/wiki/DOT_(graph_description_language)
// @see http://www.graphviz.org/content/dot-language
// @see http://www.graphviz.org/Documentation/dotguide.pdf
// @see https://github.com/cpettitt/graphlib/wiki/API-Reference#serialization
// @see https://github.com/cpettitt/graphlib-dot/wiki



// Manifest of local dot files
// @todo: generate this based on files
// @see: https://webpack.github.io/docs/context.html
var exampleDot = require('./dots/example.dot');
var manifest = require('./manifest');
var overrides = {};
var compiled = {};





var getOrElse = _.curry((path, object, orElse) => {
	if (_.has(path, object)) return _.get(path, object);
	return orElse();
}, 3);




var update = (name) => {
	var source = getOrElse(name, overrides, () =>
		getOrElse(name, manifest, () => exampleDot));

	var cleanSource = source.split('\n')
		.map((x) => x.trim())
		.join('\n');

	try {
		var graph = dot.read(cleanSource);
		return { graph, source, name };
	}
	catch (error)
	{
		console.log('ERROR', error);
		return { error, source, name };
	}
}

var load = (name) => {
	if (!compiled[name])
	{
		compiled[name] = flyd.stream();
		compiled[name](update(name));
	}

	return compiled[name];
};

var override = (name, source) => {
	overrides[name] = source;
	load(name)(update(name));
	return load(name);
};

var removeOverride = (name) => {
	delete overrides[name];
	load(name)(update(name));
	return load(name);
};








module.exports = {
	manifest,
	load,
	override,
	removeOverride,
	compiled
};
