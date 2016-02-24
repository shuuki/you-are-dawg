'use strict';
var _ = require('lodash');
var $ = require('../../core/core.es6');

var Squirrel = {};

// Find the tree, little squirrel
Squirrel.findTree = (source, land, delta) => {
	if (Math.random() > 0.75)
	{
		source.pos = $.Vec.sum(source.pos, [_.random(-1, 1), _.random(-1, 1)]);
		var at = land.at(source.pos);
		if (at.land === 'H' || at.land === 'A' || at.land === 'T')
		{
			source.status.home = source.pos;
		}
	}
};

module.exports = Squirrel;
