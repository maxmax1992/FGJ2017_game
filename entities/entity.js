var exports = module.exports = {};

exports.Entity = function(param){
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.id)
			self.id = param.id;
	}

	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
	console.log(self.x,self.y,self.spdX,self.spdY);
	console.log(Math.floor((self.x + self.spdX)/WORLD.tileSize),Math.floor((self.y + self.spdY)/WORLD.tileSize))
	if (!WORLD.solidTiles[Math.floor((self.x + self.spdX)/WORLD.tileSize)][Math.floor((self.y + self.spdY)/WORLD.tileSize)]){
		self.x += self.spdX;
		self.y += self.spdY;
		}
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}
