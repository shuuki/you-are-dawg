var flyd = require('flyd');





var Logic = function(width, height)
{
	var sources = flyd.stream([]);
	/*shrug assign self props?*/
	_.merge(this, { width, height, sources });
};

Logic.prototype.title = 'LogicManager';

Logic.prototype.add = function(source, interval)
{
	if (isNaN(interval)) interval = 0;
	var x = this.sources();
	x.push([source, interval, 0]);
	return this.sources(x);
};

Logic.prototype.remove = function(source)
{
	var x = this.sources();
	x.splice(_.findIndex(x, (a) => a[0] === source), 1);
	return this.sources(x);	
};

Logic.prototype.step = function(delta)
{
	this.sources().forEach((source) => {
		source[2] = source[2] - delta;
		if (source[2] <= 0)
		{
			source[0]();
			source[2] = source[1];
		}
	});
};








module.exports = new Logic();