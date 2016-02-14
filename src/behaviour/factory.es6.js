var dot = require('graphlib-dot');

// All the docs -- first the language, then the libs using 'em
// @see https://en.wikipedia.org/wiki/DOT_(graph_description_language)
// @see http://www.graphviz.org/content/dot-language
// @see http://www.graphviz.org/Documentation/dotguide.pdf
// @see https://github.com/cpettitt/graphlib/wiki/API-Reference#serialization
// @see https://github.com/cpettitt/graphlib-dot/wiki
var behaviors = {
	human: require('raw!./human.dot')
};

var load = (src) => {
	return new Promise((resolve, reject) => {
		resolve(dot.read(src));
	});
}

load(behaviors.human)
.then((res) => console.log(res, dot.write(res)))
.then(
	undefined,
	(err) => console.error(err)
);

module.exports = {};
