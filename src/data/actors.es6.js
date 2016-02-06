'use strict';

/**
 * a : an actor
 * What happens if we think of these as, "nouns with properties"
 * then elsewhere we give  these descriptions logic.
 * @param  {string} name - Actor's name.
 * @param  {string} sprite - For now, a char
 * @return {Actor} - a new Actor
 */
var oldA = (name, sprite, tags) => { return { name, sprite, tags: tags || [] }; };


var a = (name, sprites, tags) => {
	var x = oldA(name, sprites, tags);

	x.status = {
		hp: 20,
		entropy: 0
	};

	return x;
};

var actors = [
	a('nothing', '_'),
	a('bird', 'B'),
	a('dawg', '@', ['animal', 'fierce']),
	a('human', '!', ['animal']),
	a('squirrel', 'S', ['animal']),
	// Maybe another structure...
	a('seed', '`', ['plant']),
	a('sprout', '`', ['plant']),
	a('sapling', ',', ['plant']), 
	a('aspen', 'H', ['plant']), 
	a('spruce', 'A', ['plant']),
	a('pine', 'T', ['plant']),
	// And an attribute that you can really play with
	a('water', 'w')
];

// An array of unique actor tags
var tags = _.uniq(_.flatten(_.map(actors, 'tags')));
var names = _.uniq(_.flatten(_.map(actors, 'name')));

module.exports = {
	proto: actors,
	names,
	tags
};