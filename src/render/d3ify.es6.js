var d3ify = (value, parent) => {
	var isD3 = (x) => x.select && x.add && x.selectAll && x.data;

	if (value === undefined)
	{
		return parent;
	}
	else if (_.isArray(value))
	{
		var children = _.map(value, (val, index) => {
			var container = parent.append('div');
			return [index, d3ify(val, container)];
		});
		_.assign(parent, _.zipObject(children));
		return parent;
	}
	else if (isD3(value))
	{
		return val;
	}
	else if (_.isString(value))
	{
		return parent.append(value);
	}
	else if (_.isObject(value))
	{
		var subTree = _.mapValues(value, (val, key) => {
			var child = parent.append('div')
				.classed(key, true);
			
			return d3ify(val, child);
		});
		
	return _.assign(parent, subTree);
	}
};

module.exports = d3ify;