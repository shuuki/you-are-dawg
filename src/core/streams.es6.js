var _ = require('lodash');
var flyd = require('flyd');
flyd.previous = require('flyd/module/previous');

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



var movingAverage = flyd.curryN(2,
	(width, s) => {
		var last = 0;
		var n = 0;
		return flyd.scan((acc, next) => {
			if (n < width)
			{
				n++;
			}
			else
			{
				acc -= (last / width);
			}
			acc += (next / width);
			last = next;
			return acc;
		}, 0, s);
	});














// Time stream synced to window's animation frame
var time = flyd.stream(Date.now());
function step(timestamp) {
	time(Date.now());

	if (!time.end())//		 					Until the end of time
	{
		window.requestAnimationFrame(step);
	}
}
window.requestAnimationFrame(step);







var fps = (frames, timeStream) => {
	var s = timeStream !== undefined ? timeStream : time;
	var width = frames !== undefined ? frames : 120;
	return movingAverage(width, flyd.previous(s).map(
			(p) => isNaN(p) ? 0 : 1000 / (s() - p)
		));
}












var registerDomEvent = (window, events) => {
	var out = { deregister: undefined, stream: undefined };

	if (_.isString(events))
	{
		out.stream = flyd.stream();
		out.deregister = window.addEventListener(e, out.stream);
	}

	if (_.isArray(events))
	{
		return events.map((e) => {
			out.stream[e] = flyd.stream();
			out.deregister.push(window.addEventListener(e, out.stream[e]));
		});
	}

	if (_.isObject(events))
	{
		out.deregister = {};
		out.stream = {};
		_.forEach(events, (e, k) => {
			out.stream[k] = flyd.stream();
			out.deregister[k] = window.addEventListener(e, out.stream[k]);
		});
	}

	return out;
}

var touch = registerDomEvent(window, {
	start: 'touchstart',
	end: 'touchend',
	center: 'touchcenter',
	leave: 'touchleave',
	move: 'touchmove',
	start: 'touchstart'
}).stream;





var keys = { down: flyd.stream(), up: flyd.stream() };
window.addEventListener('keydown', keys.down);
window.addEventListener('keyup', keys.up);



module.exports = {
	// Generate
	later,
	interval,
	lookup,
	every,
	// Transform
	log, movingAverage, fps,
	// Static streams
	time,
	keys, touch // DOM events
};