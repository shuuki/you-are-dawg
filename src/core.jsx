
// Some maths
var sum = (a, b) => a+b;
var diff = (a, b) => a-b;
var square = (a) => a*a;
var dist = (a, b) => Math.sqrt(
	square(diff(a[0], b[0])) +
	square(diff(a[1], b[1]))
);






module.exports = {
	// Maths
	sum, diff, square, dist
};