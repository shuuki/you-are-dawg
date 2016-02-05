var _ = require('lodash');

var land = [

	// materials of the ground
	{chance: 100, sprite: "`", name: "dust"}, // this and the two sands are really just visual variations
	{chance: 50, sprite: ".", name: "sand"}, // the theme is "emptiness" but it needs some contrast
	{chance: 20, sprite: ":", name: "more sand"}, // extra density also helps to differentiate texture
	{chance: 2, sprite: ";", name: "dirt"}, // in here just because it's in minecraft too

	{chance: 5, sprite: ",", name: "short grass"}, // this and tall grass could both be in a progression
	{chance: 1, sprite: "/", name: "tall grass"}, // always felt like this should slow you down a little
	{chance: 5, sprite: "i", name: "reeds"}, // technically these should only occur close to water

	{chance: 0.5, sprite: "h", name: "dead tree"}, // an old sprite i drew but didn't know where to use

	{chance: 0.01, sprite: "s", name: "scrub"}, // i don't like any of these
	{chance: 0.01, sprite: "n", name: "scruff"}, // the names are fun though
	{chance: 0.01, sprite: "m", name: "cracked mud"}, // they tile nicely but look bad in random seeds


	// the trees
	{chance: 2, sprite: "A", name: "spruce"}, // these all have more or less exact numbers for spawning
	{chance: 2, sprite: "T", name: "pine"}, // but i'm too lazy to go find them right now
	{chance: 0.3, sprite: "Y", name: "juniper"}, // just going with what looks cool in the map
	{chance: 2.5, sprite: "L", name: "oak"},
	{chance: 0.2, sprite: "H", name: "aspen"},

	// things you find that may be of interest
	{chance: 0.1, sprite: "$", name: "stuff"}, // something to sniff and find random loot
	{chance: 0.01, sprite: "&", name: "bones"}, // look for food probably
	{chance: 0.01, sprite: "%", name: "more bones"}, // different kinds of bones
	{chance: 0.01, sprite: "?", name: "tracks"}, // something was here, maybe a way to track

	// human-made materials
	{chance: 0.01, sprite: "D", name: "cement"}, // these are fugly as hell
	{chance: 0.001, sprite: "g", name: "more asphalt"}, // but useful to show some things 
	{chance: 0.001, sprite: "G", name: "asphalt"}, // roads need to be a thing too

	// essential to life
	{chance: 0.01, sprite: "w", name: "water"}, 	// If this engine is good. I should be able to rip us out of the wasts and into the forest.

	// why is this here with chance set to zero? i dunno, but it's staying in
	{chance: 0, sprite: "_", name: "nothing"} 
];

var sun = [
	{time: 5, name: "night"},
	{time: 7, name: "dawn"},
	{time: 11, name: "morning"},
	{time: 13, name: "noon"},
	{time: 15, name: "afternoon"},
	{time: 19, name: "evening"},
	{time: 21, name: "twilight"},
	{time: 24, name: "night"}	
];

var moon = [
	{limit: 89, name: "new"},
	{limit: 179, name: "crescent"},
	{limit: 269, name: "first quarter"},
	{limit: 359, name: "gibbous"},
	{limit: 449, name: "full"},
	{limit: 539, name: "disseminating"},
	{limit: 629, name: "last quarter"},
	{limit: 720, name: "balsamic"}
];

var season = [
	{limit: 2191, name: "summer"},
	{limit: 4382, name: "autumn"},
	{limit: 6572, name: "winter"},
	{limit: 8764, name: "spring"}
];



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
	a('bird', 'B'),
	a('dawg', '@', ['animal', 'fierce']),
	a('human', '!', ['animal']),
	a('squirrel', 'S', ['animal']),
	// Maybe another structure...
	a('seed', '`'),
	a('sprout', '`'),		// I'm kind of liking this short-hand langauge....
	a('sapling', ','),			// "a sapling is `,` 
	a('aspen', 'H'),				// Lol, "a aspen" 
	a('spruce', 'A'),
	a('pine', 'T'),
	// And an attribute that you can really play with
	a('water', 'w')
];




// Some sensible defaults
var defaultControls = {
	// Up, W
	38: 'North', 87: 'North',
	// Down, S
	40: 'South', 83: 'South',
	// Left, A
	37: 'West', 65: 'West',
	// Right, D
	68: 'East', 39: 'East',
	// Shift, either
	16: 'sniff',
	// Make human on screen/unoccupied tile
	72: 'human'
};

var commands = _.uniq(_.values(defaultControls)); // Extract commands


module.exports = {
	land,
	sun, moon, season,		// The sun and the stars, how they travel
	actors,	// A motly crew
	// Some controls, map of KeyEvent.which => Command
	controls: defaultControls,
	commands
};
