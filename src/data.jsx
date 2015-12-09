var _ = require('lodash');

var land = [
	{chance: 100, sprite: ".", name: "sand"},
	{chance: 90, sprite: ",", name: "short grass"},
	{chance: 50, sprite: "/", name: "tall grass"},
	{chance: 15, sprite: ";", name: "dirt"},
	{chance: 5, sprite: "i", name: "reeds"},
	{chance: 1, sprite: "$", name: "stuff"},
	{chance: 1, sprite: "&", name: "bones"},
	{chance: 1, sprite: "%", name: "more bones"},
	{chance: 1, sprite: "?", name: "tracks"},
	{chance: 2, sprite: "h", name: "dead tree"},
	{chance: 2, sprite: "A", name: "spruce"},
	{chance: 2, sprite: "T", name: "pine"},
	{chance: 3, sprite: "Y", name: "juniper"},
	{chance: 2.5, sprite: "L", name: "oak"},
	{chance: 2.5, sprite: "H", name: "aspen"},
	{chance: 1, sprite: "D", name: "cement"},
	{chance: 1, sprite: "n", name: "scruff"},
	{chance: 1, sprite: "w", name: "water"},
	{chance: 1, sprite: "s", name: "scrub"},
	{chance: 1, sprite: "m", name: "cracked mud"},
	{chance: 1, sprite: "g", name: "more asphalt"},
	{chance: 1, sprite: "G", name: "asphalt"},
	{chance: 10, sprite: "`", name: "dust"},
	{chance: 10, sprite: ":", name: "more sand"},
	{chance: 0.1, sprite: "_", name: "nothing"}
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




var a = (name, sprite) => { return { name: name, sprite: sprite }; };
var actors = [
	a('bird', 'B'),
	a('dawg', '@'),
	a('human', '!'),
	a('squirrel', 'S')
];
var actorByName = _.indexBy(actors, 'name');






var defaultControls = {
	// Up, W
	38: 'North', 87: 'North',
	// Down, S
	40: 'South', 83: 'South',
	// Left, A
	37: 'West', 65: 'West',
	// Right, D
	68: 'East', 39: 'East'
};

module.exports = {
	land: land,
	sun: sun,
	moon: moon,
	season: season,
	actors: actorByName,
	// Some controls, map of KeyEvent.which => Command
	controls: defaultControls
};
