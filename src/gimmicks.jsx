var $ = require('./core.jsx');

// var trail = flyd.curryN(3, (character, stream) => flyd.on((pos) => {
// 	var chunk = getChunk(pos);
// 	var local = toLocal(chunk, pos);
// 	gameLand.at(chunk[0], chunk[1])[local[1]][local[0]] = character;
// }, stream));







// Move a pos by a direction
var cardinal = _.curry((direction, pos) => {
	switch (direction) {
		case 'East': return $.Vec.sum(pos, [1, 0]);
		case 'West': return $.Vec.sum(pos, [-1, 0]);
		case 'North': return $.Vec.sum(pos, [0, 1]);
		case 'South': return $.Vec.sum(pos, [0, -1]);
	};
	return pos;
}, 2);

var randomMove = _.curry((rng, pos) => {
	var x = rng();
	if (x <= 0.25) return $.Vec.sum(pos, [1, 0]);
	if (x <= 0.5) return $.Vec.sum(pos, [-1, 0]);
	if (x <= 0.75) return $.Vec.sum(pos, [0, 1]);
	return $.Vec.sum(pos, [0, -1]);
}, 2);











module.exports = {
	// Movement
	move: { cardinal, randomMove }
};