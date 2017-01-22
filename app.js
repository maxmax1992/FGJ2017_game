const entity = require('./entities/entity');
var Entity = entity.Entity;

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 5000);
console.log("Server started.");


var SOCKET_LIST = {};

//package types sent to the frontend
var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};
var worldpack = {flame:[],wall:[]};

var World = function(){
	var self = this;
	self.tiles = [];
	self.oldTiles = [];
	self.solidTiles = [];
	self.tileSize = 8;
	self.gridSize = 100;
	for (var i = 0; i < self.gridSize; i++) {
	    self.tiles[i] = [];
	    self.oldTiles[i] = [];
	    self.solidTiles[i] = [];
	    for (var j = 0; j < self.gridSize; j++) {
	        //self.tiles[i][j] = [0.0,0.0];
	        //self.oldTiles[i][j] = [0.0,0.0];
	        self.tiles[i][j] = 0;
	        self.oldTiles[i][j] = 0;
    	    self.solidTiles[i][j] = false;
    	    //if( i == 50 && j > 30 &&j < 60 && j != 45 && j!=44 && j!=46){
	    	if( i == 50 && j > 30 &&j < 60 && j != 45 && j!=44 && j!=46){
    		//if( i == 50 && j == 46){
    	    	console.log(i,j);
    	   	    self.solidTiles[i][j] = true; 
    			worldpack.wall.push( [i,j,true] );
    	    }
	    }
	}
}
WORLD = new World();

World.update = function(){
	var newtiles =  []
	for (var i = 0; i < WORLD.gridSize; i++) {
	    newtiles[i] = [];
	    for (var j = 0; j < WORLD.gridSize; j++) {
	    	var newval = 0
		    if ( j > 0 && j < WORLD.gridSize-1 &&  i > 0 && i < WORLD.gridSize-1){
		        //newval = Math.floor( 0.99*(WORLD.tiles[i][j-1] + WORLD.tiles[i][j+1] + WORLD.tiles[i-1][j] + WORLD.tiles[i+1][j])/2 - WORLD.oldTiles[i][j] );
		        //newval = newval = Math.floor( Math.abs( 0.99*(WORLD.tiles[i][j-1] + WORLD.tiles[i][j+1] + WORLD.tiles[i-1][j] + WORLD.tiles[i+1][j])/2 - WORLD.oldTiles[i][j] ) );
		        //newval = Math.floor(Math.abs( (WORLD.tiles[i][j-1] + WORLD.tiles[i][j+1] + WORLD.tiles[i-1][j] + WORLD.tiles[i+1][j])/2 - WORLD.oldTiles[i][j]));
		        newval = Math.round(( (WORLD.tiles[i][j-1] + WORLD.tiles[i][j+1] + WORLD.tiles[i-1][j] + WORLD.tiles[i+1][j])/2 - WORLD.oldTiles[i][j] ) );
		        newval -= Math.sign(newval);
	        }
        if (newval != WORLD.oldTiles[i][j] ){
          pack.push([i,j,newval])
        }
			  newtiles[i][j] = newval;
		}
	}
	WORLD.oldTiles = WORLD.tiles;
	WORLD.tiles = newtiles;
}


var Player = function(param){
	var self = Entity(param);
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.walking = false;
	self.shooting = false;
	self.shootcount = 0;
	self.shootLimit = 10;
	self.maxSpd = 4;
	self.hp = 10;
	self.hpMax = 10;
	self.score = 0;

	var super_update = self.update;
	self.update = function(){
		self.updateSpd();

		var oldx = self.x;
		var oldy = self.y;
		super_update();
		//if (WORLD.solidTiles[self.x/WORLD.][self.y]){
		//	self.x = oldx;
		//	self.y = oldy;
		//}

		//console.log( Math.floor(self.x/WORLD.tileSize),Math.floor(self.y/WORLD.tileSize) )
		//console.log( WORLD.tiles[Math.floor(self.x/WORLD.tileSize)][Math.floor(self.y/WORLD.tileSize)])
		if(self.pressingAttack){

			self.shootBullet(self.mouseAngle);
			self.shootWave(self.mouseAngle);
			self.shooting = true;
			self.shootcount++;
			if (self.shootcount > self.shootLimit){
				self.pressingAttack = false;
			}
		}
		else {
			self.shooting = false;
			if (self.shootcount > 0){
				self.shootcount--;
			}
		}
	}
	self.shootWave = function(angle){
		WORLD.tiles[Math.floor(self.x/WORLD.tileSize)][Math.floor(self.y/WORLD.tileSize)] = 255
		//console.log(Ma,Math.sin(angle));
		/*
		var ux = Math.cos(angle/180*Math.PI);
		var uy = Math.sin(angle/180*Math.PI);
		for (var dis = 5; dis < 55; dis += 5){
			worldpack.flame.push([	Math.floor(self.x/WORLD.tileSize + ux*dis),
									Math.floor(self.y/WORLD.tileSize + uy*dis),dis*4] );
		}
		*/
		worldpack.flame.push( [Math.floor(self.x/WORLD.tileSize),Math.floor(self.y/WORLD.tileSize),255] );
		/*Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
		});
    */
	}


	self.updateSpd = function(){
		if(self.pressingRight){
			self.spdX = self.maxSpd;
			self.walking = true;
		}
		else if(self.pressingLeft){
			self.spdX = -self.maxSpd;
			self.walking = true;
		}
		else{
			self.spdX = 0;
			self.walking = false;
		}

		if(self.pressingUp){
			self.spdY = -self.maxSpd;
			self.walking = true;
		}
		else if(self.pressingDown){
			self.spdY = self.maxSpd;
			self.walking = true;
		}
		else{
			if(0 == self.spdX){
			self.spdY = 0;
			self.walking = false;
			}
		}
	}

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			walking:self.walking,
			shooting:self.shooting,
			mouseAngle:self.mouseAngle
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
			walking:self.walking,
			shooting:self.shooting,
			mouseAngle:self.mouseAngle
		}
	}

	Player.list[self.id] = self;

	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket){
	var player = Player({id:socket.id,});
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});

	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		wave:Wave.getAllInitPack(),
		bullet:Bullet.getAllInitPack()
	})
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}
var Bullet = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle;///180*Math.PI;
	console.log(self.angle);
	self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
	self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
	self.parent = param.parent;

	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
			self.toRemove = true;

			super_update();

			for(var i in Player.list){
				var p = Player.list[i];
				if(self.getDistance(p) < 32 && self.parent !== p.id){
					p.hp -= 1;
					if(p.hp <= 0){
						var shooter = Player.list[self.parent];
						if(shooter)
							shooter.score += 1;
						p.hp = p.hpMax;
						p.x = Math.random() * 500;
						p.y = Math.random() * 500;
					}
					self.toRemove = true;
				}
			}
		}
		self.getInitPack = function(){

			//console.log('bullet.getInitPack');
			return {
				id:self.id,
				x:self.x,
				y:self.y,
				a:self.angle,
			};
		}
		self.getUpdatePack = function(){

			//console.log('bullet.getUpdatePack');
			return {
				id:self.id,
				x:self.x,
				y:self.y,
			};
		}

		Bullet.list[self.id] = self;
		initPack.bullet.push(self.getInitPack());
		return self;
	}

	Bullet.list = {};

	Bullet.update = function(){
		var pack = [];
		for(var i in Bullet.list){
			var bullet = Bullet.list[i];
			var oldx = bullet.x;
			bullet.update();
			//console.log(oldx,bullet.x);
			if(bullet.toRemove){
				delete Bullet.list[i];
				removePack.bullet.push(bullet.id);
			} else
				pack.push(bullet.getUpdatePack());
		}
		//console.log(pack);
		return pack;
	}

	Bullet.getAllInitPack = function(){
		var bullets = [];
		for(var i in Bullet.list)
			bullets.push(Bullet.list[i].getInitPack());
		return bullets;
	}


var Wave = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle/180*Math.PI;
	self.spd = 10;
	self.dis = 0;
	self.parent = param.parent;

	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
			self.toRemove = true;
		//super_update();
		self.dis += self.spd;
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.getDistance(p) < 32 && self.parent !== p.id){
				p.hp -= 1;
				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score += 1;
					p.hp = p.hpMax;
					p.x = Math.random() * 500;
					p.y = Math.random() * 500;
				}
				self.toRemove = true;
			}
		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			a:self.angle,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			dis:self.dis,
		};
	}

	Wave.list[self.id] = self;
	initPack.wave.push(self.getInitPack());
	return self;
}
Wave.list = {};

Wave.update = function(){
	var pack = [];
	for(var i in Wave.list){
		var wave = Wave.list[i];
		wave.update();
		if(wave.toRemove){
			delete Wave.list[i];
			removePack.wave.push(wave.id);
		} else
			pack.push(wave.getUpdatePack());
	}
	return pack;
}

Wave.getAllInitPack = function(){
	var waves = [];
	for(var i in Wave.list)
		waves.push(Wave.list[i].getInitPack());
	return waves;
}

var DEBUG = true;

var isValidPassword = function(data,cb){
	return cb(true);
	/*db.account.find({username:data.username,password:data.password},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});*/
}
var isUsernameTaken = function(data,cb){
	return cb(false);
	/*db.account.find({username:data.username},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});*/
}
var addUser = function(data,cb){
	return cb();
	/*db.account.insert({username:data.username,password:data.password},function(err){
		cb();
	});*/
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	Player.onConnect(socket);

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on('sendMsgToServer',function(data){
		var playerName = ("" + socket.id).slice(2,7);
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
		}
	});

	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});
});

setInterval(function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
		world:worldpack,
	}

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',initPack);
		socket.emit('update',pack);
		socket.emit('remove',removePack);
	}
	initPack.player = [];
	initPack.wave = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.wave = [];
	removePack.bullet = [];
	worldpack.flame = [];
},1000/25);

/*
var profiler = require('v8-profiler');
var fs = require('fs');
var startProfiling = function(duration){
	profiler.startProfiling('1', true);
	setTimeout(function(){
		var profile1 = profiler.stopProfiling('1');

		profile1.export(function(error, result) {
			fs.writeFile('./profile.cpuprofile', result);
			profile1.delete();
			console.log("Profile saved.");
		});
	},duration);
}
startProfiling(10000);
*/
