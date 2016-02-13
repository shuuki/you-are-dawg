'use strict';

var _ = require('lodash');
var flyd = require('flyd');

var ActorFactory = function(actorList)
{
	this.actorsByName = _.keyBy(actorList, 'name');
};

var _actorIdCount = 0;
ActorFactory.prototype.actor = function(name, pos)
{
	name = name || 'nothing';

	var newActor = _.cloneDeep(this.actorsByName[name]);
	newActor.pos = !pos ? [0, 0] : pos;
	newActor.life = flyd.stream(newActor);
	newActor.id = _actorIdCount++;
	newActor.toString = () => newActor.name;

	return newActor;
};

module.exports = ActorFactory;