'use strict';


/////////////////
/// 
/// 
/// @TODO:
/// 
/// FINISH the ideas I'm throwing down here
/// Build API
/// 
/// 
/////////////////


// Time conversions to drive the universe
// Relative multipler for deltas
// Higher value = faster steps forward in time
var timeWarp = 2; // each ms = 10 minutes

// Map of conversions for this planet's seasons
var planetTime = { // Earth based
	// hour -> day
	day: 24,
	// day -> month
	month: 30,
	// month -> year
	year: 52
};

// Our rhythms are well defined
var circadian = {
	now: 0,
	day: 0, month: 0, year: 0,
	hour: 0, minute: 0, second: 0,
	sol: verse.sol[0], luna: verse.luna[0]
};

var fromMillis = {
	second: 1000,
	minute: 1000 * 60,
	hour: 1000 * 60 * 60
};
// Specific to local planet
fromMillis.day = planetTime.day * fromMillis.hour;
fromMillis.month = planetTime.month * fromMillis.day;
fromMillis.year = planetTime.year * fromMillis.month;


var clock = d3.select(document.body).append('div').classed('clock', true);
var secondHand = clock.append('div').classed('second', true);
var minuteHand = clock.append('div').classed('minute', true);
var hourHand = clock.append('div').classed('hour', true);




var bin = (base, start, end) => (base / start) % end;
var rhythm = (circadian, delta) => {
	// Relative to start
	circadian.now += delta * timeWarp;
	circadian.second = bin(circadian.now, fromMillis.second, 60);
	circadian.minute = bin(circadian.now, fromMillis.minute, 60);
	circadian.hour = bin(circadian.now, fromMillis.hour, planetTime.day);
	circadian.day = bin(circadian.now, fromMillis.day, planetTime.month);
	circadian.month = bin(circadian.now, fromMillis.month, planetTime.year);
	circadian.year = bin(circadian.now, fromMillis.year, Number.MAX_SAFE_INTEGER);
	circadian.sol = $.getBin('time', undefined, verse.sol, circadian.hour);
	circadian.luna = $.getBin('limit', undefined, verse.luna, circadian.month % 1);

	return circadian;
};

var circadian = {
	now: 0,
	day: 0, month: 0, year: 0,
	hour: 0, minute: 0, second: 0,
	sol: verse.sol[0], luna: verse.luna[0]
};




module.exports = {
	earth, base, stream
	rhythm
};