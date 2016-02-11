'use strict';

var d3 = require('d3');
var mainTpl = require('./main.jade');

module.exports = (element) => {
	var html = mainTpl();
	element.innerHTML = html;

	// Grab shit out of jade
	// @todo: this but better
	return {
		game: d3.select('.game'),
		map: d3.select('.map'),
		controls: d3.select('.controls'),
		debug: d3.select('.debug'),
		log: d3.select('.log')
	};
};
