var _ = require('lodash');
var $ = require('../core/core.es6');

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




// LOGIC MOVER FUNCTION WITH A BUNCH OF DEPENDENCIES
var playerMover = _.curry((commandState, tileUnderPlayer, player, land, delta) => {
	// Snap to max is someone shortened it
	player.status.move.current = Math.min(player.status.move.current, player.status.move.max);
	if (player.status.move.current > 0)
	{
		player.status.move.current -= delta;
	}
	var commands = commandState();
	player.status.sniffing = !_.isEmpty(commands.sniff);
	player.status.move.max = player.status.sniffing ? 400 : 200;

	if (!_.isEmpty(commands) && player.status.move.current <= 0)
	{
		player.pos = _.reduce(commands, (pos, v, dir) => cardinal(dir, pos), player.pos);
		player.status.move.current = player.status.move.max;
	}

	tileUnderPlayer(land.at(player.pos));

	// @todo: check if changed
	player.life(player);
}, 5);









module.exports = {
	// Movement
	move: {
		cardinal, randomMove,
		player: playerMover
	}
};