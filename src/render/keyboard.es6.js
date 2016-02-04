var keyboardTpl = require('./keyboard.jade');

var renderKeyboard = (selection, data) => {

	var rendered = keyboardTpl({
		data: data
	});

	selection.node().innerHTML = rendered;
};

module.exports = renderKeyboard;