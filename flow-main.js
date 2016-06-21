
var canvDiv;

var flow;

var nodes = [];

var curTime = 0;
var fps = 60;
var sps = 120;
// var t0=0;

var dragging = false;
var mouse = [ 0, 0 ];

var wiring; // wire under consruction: [srcNode,srcPort,wire,pt]

var play = false;

var socket;
var localSocket = {};

function init() {
	canvDiv = document.getElementById("container" );

	if ( document.io ) {
		socket = io.connect( "http://login.sccs.swarthmore.edu:8201" );
	}


	makeTypes();

	// window.setInterval(step,1000/sps);
	// t0=Date.now()/1000;
	step();

	// window.setInterval(draw,1000/fps);

	// this is supposed to be better.
	(function animloop() {
      requestAnimFrame( animloop );
      draw();
    })();


	var tmpScene = localStorage.getItem("tmpScene" );
	if ( tmpScene ) {
	   loadScene( JSON.parse( tmpScene ) );
	}

	/*
	logger=new nodeTypes.Logger({x:500,y:200});
	summer=new nodeTypes.Summer({x:200,y:100});
	mou=new nodeTypes.Mouse( {x:100,y:180});
	tim=new nodeTypes.Time(  {x: 50,y:410});
	sin1=new nodeTypes.Sine( {x: 50,y:300,i:{freq:.5}});
	sin2=new nodeTypes.Sine( {x:200,y:300,i:{freq:4.05}});
	dis=new nodeTypes.Scope( {x:500,y:350});
	cus=new nodeTypes.Custom({x:200,y:400});
	t2=new nodeTypes.X2(	 {x:350,y:150});


	mkWire(sin1,'y',sin2,'amp',100);
	mkWire(sin2,'y',dis,'y1',220);

	mkWire(summer,'c',t2,'a',0);
	mkWire(t2,'b',logger,'msg',100);

	mkWire(tim,'t',cus,'a',320);
	mkWire(tim,'t',dis,'x',320);

	mkWire(cus,'x',dis,'y2',0);
	mkWire(cus,'y',dis,'y3',100);
   // mkWire(lfo,'y',dis,'y1',220);

	*/

	makeLibrary();

// 	canvDiv.onmousedown=function(e){
// 		console.log(e);
// 	}

}


var draw = function draw() {
	// if ( play ) {
		// step();

		for ( var ii in nodes ) {
			nodes[ ii ].draw();
		}
	// }
};

// main run loop
var step = function step() {
	// curTime=Date.now()/1000-t0;
	if ( play ) {
		curTime += 1 / sps;

		for ( var ii in nodes ) {
			nodes[ ii ].eval();
		}
		for ( var ii in nodes ) {
			nodes[ ii ].progress();
		}

	}

	window.setTimeout( step, 1000 / sps );
};

function unloading() {
	localStorage.setItem("tmpScene", JSON.stringify( exportNodes( nodes ) ) );
}

// misc utility funcs

Math.dist = function( x1, y1, x2, y2 ) {
	return Math.sqrt( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) );
};

objectSize = function( obj ) {
	var size = 0, key;
	for ( key in obj ) {
		if ( obj.hasOwnProperty( key ) ) {
			size++;
		}
	}
	return size;
};


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function( /* function */ callback, /* DOMElement */ element ) {
      window.setTimeout( callback, 1000 / 60 );
    };
})();
