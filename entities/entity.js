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
	//COLLISION
	var nx = self.x + self.spdX;
	var ny = self.y + self.spdY;
	while(nx<0){
		nx += WORLD.SIZE;
	}
	while(nx>WORLD.SIZE){
		nx -= WORLD.SIZE;
	}
	while(ny<0){
		ny += WORLD.SIZE;
	}
	while(ny>WORLD.SIZE){
		ny -= WORLD.SIZE;
	}
	if (!WORLD.solidTiles[Math.floor(nx/WORLD.tileSize)][Math.floor(ny/WORLD.tileSize)]){
		self.x = nx;
		self.y = ny;
		}
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}
