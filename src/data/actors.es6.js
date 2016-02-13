'use strict';

/**
 * a : an actor
 * What happens if we think of these as, "nouns with properties"
 * then elsewhere we give  these descriptions logic.
 * @param  {string} name - Actor's name.
 * @param  {string} sprite - For now, a char
 * @return {Actor} - a new Actor
 */
var a = (name, sprite, tags) => { return { name, sprite, tags: tags || [] }; };

var actors = [
	a('nothing', '_'),
	a('bird', 'B', ['animal']),
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
	a('water', 'w'),
	// Just THINGS
	a('stick', '-', ['item', 'grab'])
];

// An array of unique actor tags
var tags = _.uniq(_.flatten(_.map(actors, 'tags')));
var names = _.uniq(_.flatten(_.map(actors, 'name')));



// Cooldown status helper
var cooldown = (max, current) => { return { max, current: !current ? 0 : current }; };

// Helpers
var someTags = (actor, tags) => _.intersection(actor.tags, tags).length > 0;
var allTags = (actor, tags) => _.difference(tags, actor.tags).length === 0;

// Apply status based on tags and name
actors.forEach((actor) => {
	var status = {};

	// If the tags
	if (someTags(actor, ['plant', 'animal']))
	{
		status.hp = 20;
	}

	// Plants get entropy
	if (someTags(actor, ['plant']))
	{
		status.entropy = 0;
	}

	// Dawg gets status
	if (actor.name === 'dawg')
	{
		status.sniffing = false;
		status.move = cooldown(250);
	}

	if (actor.name === 'human')
	{
		status.hp = 50;
		status.affect = {
			trusting: 0,
			fearful: 0,
			loving: 0,
			empathetic: 0,
			companionship: 0
		};
	}


	actor.status = status;
});




module.exports = {
	proto: actors,
	names,
	tags
};