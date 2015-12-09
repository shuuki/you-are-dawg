var flyd = require('flyd');

// @see https://github.com/paldepind/flyd/tree/master/module/every
var every = require('flyd/module/every');

/**
 * Emits value after `duration` ms then ends
 * @param  {number} duration - Duration in millis before emitting data
 * @param  {object} value - The value to deliver after the delay
 * @return {stream}
 */
var later = flyd.curryN(2, (duration, value) => {
	var s = flyd.stream();
	
	setTimeout(() => {
		s(data);
		s.end(true);
	}, duration);
	
	return s;
});

/**
 * Samples `fn` every `interval` ms. End the stream to stop polling.
 * Calls `fn` on leading as initial value.
 * @param  {number} interval
 * @param  {function<*>} fn
 * @return {stream<*>}
 */
var interval = flyd.curryN(2, (interval, fn) => {
	var s = flyd.stream(fn());

	// Tick, tock
	(function tock(){
		setTimeout(() => {
			s(fn());
			if (!s.end()) {
				tock();
			}
	}, interval);
	})();

	return s;
});

/**
 * Casts a stream's values to console.
 * @param  {stream} - Stream to case
 * @return {stream} - Origional stream
 */
var log = flyd.map((x) => { console.log(x); return x; });


/**
 * Maps values of stream through a lookup map
 * @param  {Map<T, *>} map - Lookup to map values through
 * @param  {stream<T>} stream - Source values
 * @return {stream<*>} - Stream of mapped values
 */
var lookup = flyd.curryN(2,
	(map, stream) => flyd.combine(
		(x, self) => {self(map[stream()])}, [stream])
);


// Time stream synced to window's animation frame
var time = flyd.stream(Date.now());

function step(timestamp) {
	time(timestamp);

	if (!time.end())//		 					Until the end of time
	{
		window.requestAnimationFrame(step);
	}
}
window.requestAnimationFrame(step);




module.exports = {
	// Generate
	later,
	interval,
	lookup,
	every,
	// Transform
	log,
	// Static streams
	time,
};