// Libs
var flyd = require('flyd');
var chance = require('chance');
var d3 = require('d3');
var _ = require('lodash');

// Deps
var verse = require('./data.jsx');			// A universe of data
var $ = require('./core.jsx');				// Core nice stuff 
var streams = require('./streams.jsx');		// Stream goodies
var log = streams.log; // EVEN SHORTER

// Style
require('./index.less');

var time = streams.time;

console.log(verse);


/**
 * Our main function.
 * @param {Document} d - DOM document object.
 * @param {Window} w - DOM window object.
 * @param {object} verse - The universe of data.
 */
var go = (d, w, verse) => {
	// Print some things
	d.write("the first season is: " +
					verse.season[0].name + "<br>");
	d.write("the phases of the moon are: " +
					_.pluck(verse.moon, "name").join(", ") + "<br>");
	d.write("the total weight of all terrain is: " +
					_.reduce(_.pluck(verse.land, "chance"), $.sum) + "<br>");

// fire off the finder to give me something... i got 99 problems but sprites ain't one
	var maplike = $.correlatum(Math.random, 99,
		_.pluck(verse.land, "sprite"),
		_.pluck(verse.land, "chance")).join("");
	d.write("here's a weighted pseudorandom blob: " +"<p class='glyph'>"+ maplike + "</p><br>");

	// fire off the thing and tell me what time it is at 12
	d.write("12:00 is called " + $.correlator(Math.random, _.pluck(verse.sun, "name"), _.pluck(verse.sun, "time"), 12) + "<br>")
	d.write("06:00 is called " + $.correlator(Math.random, _.pluck(verse.sun, "name"), _.pluck(verse.sun, "time"), 6) + "<br>")

	d.write('<hr>');
	




















/////////////////
// BEGIN MAP ?!
////////////////	
	var gameNode = d3.select(d.body).append('div').classed('game', true);
	var btnRow = gameNode.append('div').classed('flex-row', true);
	var buttons = btnRow.append('div').classed('buttons', true);
	var controls = ['North', 'South', 'East', 'West'];
	var clicks = flyd.stream();
	var up = buttons.selectAll('button').data(controls);
	[up, up.enter().append('button')].forEach((group => {
		group.on('click', clicks);
		group.text((d) => d);
	}));
	var timeRender = btnRow.append('div').classed('time', true);
	flyd.on((t) => timeRender.text(t), time);
	

	// Same seed every run for now
	var seed = 314159;
	var rand = new Chance(seed);
	var chunkWidth = 20;
	var chunkHeight = 20;
	
	// Convery (pos[x, y]) into chunk index
	var getChunk = (pos) => [Math.floor(pos[0] / chunkWidth), Math.floor(pos[1] / chunkHeight)];
	var toLocal = (chunk, pos) => [
			pos[0] - chunk[0] * chunkWidth,
			chunkHeight - (pos[1] - chunk[1] * chunkHeight) - 1
		];
	
	// Generate a chunk
	var genChunk = (rows, cols, rng) => {
		return _.chunk($.correlatum(
			rng, rows * cols,
			_.pluck(verse.land, "sprite"),
			_.pluck(verse.land, "chance")
		), cols);
	}
	
	/**
	 * Land represents the terrain of the world.
	 * It's in charge of generating/remembering a world based on (x, y) coordinates.
	 * @todo: manipulations?
	 */
	var Land = function(rng){ this.rng =  rng; this._data = {}; };
	
	/** Unique way to map (a, b) to a string key for lookup */
	Land.prototype.keyFn = function(a, b){ return a + ',' + b; };
	
	/** Get or generate the map at (a, b) -- currently using 20x20 chunks -- returns as a [row][col] array! */
	Land.prototype.at = function(a, b){
		var key = this.keyFn(a, b);
		if (!this._data[key]) {
			this._data[key] = genChunk(chunkWidth, chunkHeight, () => this.rng.random());
		};
		return this._data[key];
	};
	
	
	
	
	




















	
	// Player object, has data and position in the grid
	var player = { pos: flyd.stream([10, 10]) };
	
	// Instance of land to work with
	var gameLand = new Land(rand);
	
	// This is the chunk we render
	var activeChunk = player.pos.map(getChunk)
	
	// Compute the current terrain chunk to render
	var terrain = flyd.combine((chunk) => {
		var chunkPos = chunk();
		
		var land = _.cloneDeep(
			gameLand.at(chunkPos[0], chunkPos[1])
		);
		
		return land.map((x) => x.join(''));
	}, [activeChunk]);
	
	
	
	flyd.on((pos) => {
		var chunk = getChunk(pos);
		var land = gameLand.at(chunk[0], chunk[1]);
		var local = toLocal(chunk, pos);
		land[local[1]][local[0]] = 'T';
	}, player.pos);
	
	
	
	// We have player.pos
	var dawgActor = flyd.combine((pos) => {
		return {
			name: 'dawg',
			pos: pos(),
			sprite: verse.actors.dawg.sprite
		};
	}, [player.pos]);
	
	var bird = {
		pos: flyd.stream([-10, 9])
	};
	var birdActor = flyd.combine((pos) => {
		return {
			name: 'bird',
			pos: pos(),
			sprite: verse.actors.bird.sprite
		}
	}, [bird.pos]);
	
	var human = {
		pos: flyd.stream([12, 5])
	};
	var humanActor = flyd.combine((pos) => {
		return {
			name: 'human',
			pos: pos(),
			sprite: verse.actors.human.sprite
		}
	}, [human.pos]);
	
	var squirrel = {
		pos: flyd.stream([3, 5])
	};
	var squirrelActor = flyd.combine((pos) => {
		return {
			name: 'squirrel',
			pos: pos(),
			sprite: verse.actors.squirrel.sprite
		}
	}, [squirrel.pos]);
	

























	
	// Make the squirrel move!
	var update = streams.interval(500, () => {
		var cur = squirrel.pos();
		cur[0] = cur[0] + (1 - _.random(2));
		cur[1] = cur[1] + (1 - _.random(2));
		squirrel.pos(cur);
		
		var curBird = bird.pos();
		curBird[0] = curBird[0] + 1;
		curBird[1] = Math.random() < 0.3 ? (curBird[1] + Math.random() > 0.5 ? 1 : -1) : curBird[1];
		bird.pos(curBird);

		return [squirrel, bird];
	});

	
	



	var dogOnSand = flyd.combine((dog) => {
		var pos = dog();
		var chunk = getChunk(pos);
		var terrainChunk = gameLand.at(chunk[0], chunk[1]);
		var local = toLocal(chunk, pos);
		return terrainChunk[local[1]][local[0]] === '.';
	}, [player.pos]);
	
	var actorDistance = flyd.combine((a, b) => $.dist(a(), b()));
	
	var distanceToHuman = actorDistance([player.pos, human.pos]);
	var canTalkToHuman = distanceToHuman.map((x) => x < 1.5);
	
	var canEatSquirrel = actorDistance([player.pos, squirrel.pos]).map((x) => x < 1);

	
	
	
	


















	
	
	
	/// RENDER ACTORS
	var actorLayer = flyd.combine(function(){
		var chunk = arguments[arguments.length -3]();
		var actorsToRender = Array.prototype.slice.call(arguments, 0, -3)
			.map((x) => x())
			.filter((x) => _.isEqual(getChunk(x.pos), chunk));
		
		var emptyMap = _.chunk(_.map(new Array(chunkWidth * chunkHeight), (x) => 'a'), chunkWidth);
		
		actorsToRender.forEach((actor) => {
			var local = toLocal(chunk, actor.pos);
			if (_.isArray(actor.sprite))
			{
				actor.sprite.forEach((row, yOffset) => {
					row.forEach((cell, xOffset) => {
						if (local[1] + yOffset < chunkWidth && local[0] + xOffset < chunkHeight)
						emptyMap[local[1] + yOffset][local[0] + xOffset] = cell;
					});
				});
			}
			else
			{
				emptyMap[local[1]][local[0]] = actor.sprite;
			}
		});
		
		emptyMap = emptyMap.slice(0, chunkHeight).map((row) => row.slice(0, chunkWidth));
		
		return emptyMap.map((x) => x.join(''));
	}, [birdActor, humanActor, squirrelActor, dawgActor, activeChunk]);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	// DOM element to render game into
	var map = gameNode.append('div').classed('map', true);
	
	// Render land row array onto a d3 selection map
	var renderMap = (map, land) => {
		var rows = map.selectAll('p').data(land);
		// Render the data as text
		[
			rows,							// d3 update 
		 	rows.enter()			// and endter
				.append('p')
				.classed('glyph', true)
		].forEach((sel) => sel.text((d) => d));
		
		// Cleanup
		rows.exit().remove();
	};
	
	// Bind and attach render
	var boundRender = _.partial(renderMap, map);
	flyd.on(boundRender, terrain);
	
	var map2 = gameNode.append('div').classed('actor map', true);
	flyd.on(_.partial(renderMap, map2), actorLayer);
	















	
	
	
	flyd.on((onSand) => {
		map2.classed('other', onSand);
	}, dogOnSand);
	
	flyd.on((canTalk) => {
		map.classed('faded', canTalk);
	}, canTalkToHuman);
	
	flyd.on((canEat) => {
		map.classed('other', canEat);
	}, canEatSquirrel);
	
	
	
	








	
	
	
	
	// Track key pressess!
	var keys = flyd.stream();
	w.addEventListener('keydown', keys);
	var keyCode = keys.map((x) => x.which);
	var keyToDirection = streams.lookup(verse.controls, keyCode);

	// Merge direction commands together
	var merged = flyd.merge(keyToDirection, clicks);
	
	// On direction command, update player position
	flyd.on((direction) => {
		var currentPos = player.pos();
		
		switch (direction) {
			case 'East':
				currentPos[0] = currentPos[0] + 1;
				break;
			case 'West':
				currentPos[0] = currentPos[0] - 1;
				break;
			case 'North':
				currentPos[1] = currentPos[1] + 1;
				break;
			case 'South':
				currentPos[1] = currentPos[1] - 1;
				break;
		}
		
		// And push the update
		player.pos(currentPos);
	}, merged);
	
	
	
	
	
	
	
	
	






	
	
	var minimap = gameNode.append('div').classed('minimap map', true);
	var minimapData = [];
	var chunks = flyd.combine((chunk) => {
		var currentChunk = chunk();
		var data = gameLand._data;
		var discoveredCells = _.keys(data);
		var pairs = discoveredCells.map((str) => str.split(',').map((x) => +x));
		var xBounds = [
			_.min(_.pluck(pairs, '0')),
			_.max(_.pluck(pairs, '0'))
		];
		var yBounds = [
			_.min(_.pluck(pairs, '1')),
			_.max(_.pluck(pairs, '1'))
		];
		var emptyMap = _.chunk(
						_.map(new Array(chunkWidth * chunkHeight), (x) => 'a'),
						chunkWidth);
		
		var rows = [];
		for (var y = yBounds[1]; y >= yBounds[0]; y--)
		{
			var row = [];
			for (var x = xBounds[0]; x <= xBounds[1]; x++)
			{
				var key = gameLand.keyFn(x, y);
				if (data[key] === undefined)
				{
					row.push(emptyMap);
				}
				else
				{
					row.push(data[key]);
				}
			}
			rows.push(row);
		}
		
		
		var out = rows.reduce((acc, row, i) => {
			// Chunk row => actual row
			var reducedRow = row.reduce((acc, chunk) => {
				chunk.map((x) => x.join('')).forEach((row, i) => {
					if (acc[i] === undefined) { acc[i] = ''; };
					acc[i] += row;
				});
				return acc;
			}, []);
			
			reducedRow.forEach((row) => acc.push(row));
			
			
			return acc;
		}, []);

		renderMap(minimap, out);
	}, [activeChunk]);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
};






// vvvvvvvv data vvvvvvv

// Kick it off!!!!
go(document, window, verse);