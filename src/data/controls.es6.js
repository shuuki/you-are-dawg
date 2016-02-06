var _ = require('lodash');

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
	defaultControls,
	commands
};
