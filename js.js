var CIRCLE = Math.PI * 2,
	GRAVITY = 15, // amount to drop per frame drawn (exagerated when there is little time between frames)
	WIND = -1,
	MAX_DRAW_DELAY = 50,
	MAX_RAYS = 15,
	MAX_EXPLOSION_LAYERS = 5;

function FireworksCelebration(){
	this.fireworks = [];
}
//todo: have this not create DOM elements for the fireworks until they are ready to launch
FireworksCelebration.prototype.create = function(){
	for(var i = 0; i<100; i++){
		this.fireworks.push(new Firework());
	}
	return this;
};

FireworksCelebration.prototype.start = function(){
	this.fireworks.forEach(function(firework,i){
		setTimeout(function(){
			firework.launch();
		},(i * 3500 * Math.random() ));
		
	});
	return this;
};

FireworksCelebration.prototype.stop= function(){
	return this;
};
FireworksCelebration.prototype.destroy = function(){
	return this;
};

function Firework(){
	var self = this,
		$container = $('body'),
		leftOffset = window.outerWidth / 2,
		flightTime = Math.max( 1500 * Math.random(), 1500 * 0.7),
		flightSeconds = flightTime / 1000,
		transitionString = 'top ' + flightSeconds + 's ease-out, left ' + flightSeconds + 's ease-out';

	self.left = leftOffset;
	self.flightTime = flightTime;

	self.$ele = $('<div />')
		.addClass('firework')
		.css({
			opacity: 0,
			position: 'absolute',
			top: window.outerHeight,
			left: leftOffset,
			'-moz-transition': transitionString,
			'-ms-transition': transitionString,
			transition: transitionString
		})
		.appendTo($container);

	//self.ctx = self.$ele[0].getContext('2d');
}

Firework.prototype.launch = function(){
	var self = this,
		drift =  300 * Math.random() * ( Math.round(Math.random()) || -1 ),
		newLeft = this.left + drift;

	// trigger animation
	self.$ele.css({
		opacity: 1,
		top: window.innerHeight / 2 * Math.random(), // set to a random distance from top of screen
		left: newLeft
	});

	// after flight time, trigger explosion and destroy element
	setTimeout(function(){
		var position = self.$ele.offset();
		self.destroy();
		new LayeredExplosion(position.left,position.top);
	},self.flightTime);
	
};

Firework.prototype.update = function(){

};

Firework.prototype.destroy = function(){
	this.$ele.remove();
	return this;
};


function Explosion(x,y,width,height,rays){
	var that = this;

	this.height = height;
	this.width = width;
	this.rays = rays;
	this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
	this.duration = Math.floor(Math.random() * 750, 200);
	this.fade = 4; // seconds

	this.$ele = $('<canvas />')
		.addClass('explosion')
		.css({
			position: 'absolute',
			top: y,
			left: x,
			'-webkit-transition': 'opacity 4s ease-in, top ' + this.fade + 's ease-in',
			'-moz-transition': 'opacity 4s ease-in, top ' + this.fade + 's ease-in',
			'-ms-transition': 'opacity 4s ease-in, top ' + this.fade + 's ease-in',
			transition: 'opacity 4s ease-in, top ' + this.fade + 's ease-in',
			opacity: 1
		})
		.appendTo('body');

	this.$ele[0].width = this.width;
	this.$ele[0].height = this.height * 2;

	this.ctx = this.$ele[0].getContext('2d');

	for(var i = 1; i <= this.rays; i++){
		// create rays evenly distributed in circle around center point
		new ExplosionRay(this.ctx,this.height,this.width,CIRCLE * i / this.rays,1000,this.color);
	}

	setTimeout(function(){
		var top = that.$ele.offset().top;
		that.$ele.css({
			top: top + 100
		});
	});

	setTimeout(function(){
		var top = that.$ele.offset().top;
		that.$ele.css({
			opacity: 0,
		});
	},500);

	setTimeout(this.destroy.bind(this),this.fade * 1000);

}

Explosion.prototype.destroy = function(){
	this.$ele.remove();
};

function ExplosionRay(ctx,height,width,angle,duration,color){
	var i = 0,
		frameLength = Math.max(Math.round(Math.random() * MAX_DRAW_DELAY),1), // how long will pass between update renders
		numFrames = duration / frameLength, // we want to keep the duration the amount of time passed in and vary the frames to fit
		x = width / 2,
		y = height / 2,
		xIncrement = Math.cos(angle) * width / 2 / numFrames, // distance to travel each frame, wind drift independent
		yIncrement = Math.sin(angle) * height / 2 / numFrames, // distance to travel each frame, gravity independent
		momentum = 1;

	ctx.fillStyle = color;

	while(i<numFrames){
		momentum = numFrames / ( numFrames - i); // 1 for full momentum, lower for low momentum
		updateRayPosition(x,y,(1 * 1 / i * 5), momentum, i * frameLength);
		
		x -= xIncrement;
		y -= yIncrement;

		i++;
	}

	function updateRayPosition(x,y,opacity,momentum,when){
		setTimeout(function(){
			ctx.globalAlpha = opacity;
			ctx.fillRect(x + (WIND * momentum),y + (GRAVITY * momentum ) ,2,2);
		},when);
	}
}
// creates multiple explosions layered on top of each other and scaled relative to each other to produce something with volume
function LayeredExplosion(x,y){

	// size of largest layer is between 300 and half of screen size
	var fireworkSize = Math.max( Math.round(Math.random() * window.innerWidth * 0.5 ), 300),
		numLayers = Math.ceil(Math.random() * MAX_EXPLOSION_LAYERS), // firework can have between 1 and MAX_EXPLOSION_LAYERS layers
		rays,layerSize,layerOffset;

	// draw the layers
	for(var i = 1; i <= numLayers; i++){
		layerSize = fireworkSize * ( (i) / numLayers); // each layer is larger than the previous layer, working up to the full size
		offset = layerSize / 2; // offset helps us draw from the middle
		rays = Math.max(Math.round( Math.random() * MAX_RAYS),3); // each layer can have between 3 and MAX_RAYS rays

		new Explosion(x - offset, y - offset, layerSize, layerSize, rays);
	}
}

var works = new FireworksCelebration().create().start();


/*
	Demo Stuff

*/

$('#gravity')
	.val(GRAVITY)
	.on('change',function(){
		GRAVITY = this.value;
	});

$('#wind')
	.val(WIND)
	.on('change',function(){
		WIND = this.value;
	});

$('#draw-delay')
	.val(MAX_DRAW_DELAY)
	.on('change',function(){
		MAX_DRAW_DELAY = this.value;
	});
	
$('#max-rays')
	.val(MAX_RAYS)
	.on('change',function(){
		MAX_RAYS = this.value;
	});
	
$('#max-layers')
	.val(MAX_EXPLOSION_LAYERS)
	.on('change',function(){
		MAX_EXPLOSION_LAYERS = this.value;
	});