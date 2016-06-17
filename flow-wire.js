
var Wire = function Wire( p1, p2, color ) {

	var element = document.createElement( "canvas" );
	canvDiv.appendChild( element );
	var ctx;
	element.style[ "pointer-events" ] = "none";
	element.style.zIndex = "-1";

	var thick = 3.3;

	var margin = 4;

	this.p1 = p1;
	this.p2 = p2;

	this.color = color;

	// x1,y1,x2,y2
	this.redraw = function() {

		var x = Math.min( p1[ 0 ], p2[ 0 ] ) - margin;
		var y = Math.min( p1[ 1 ], p2[ 1 ] ) - margin;

		var w = Math.abs( p1[ 0 ] - p2[ 0 ] ) + margin * 2;
		var h = Math.abs( p1[ 1 ] - p2[ 1 ] ) + margin * 2;

		// TODO: find a better value for half so that the wires adapt betterto the nodes separation
		// var half=w/3*((p1[1]>p2[1])?1:2)

		var dist = computeWireDistance( p1, p2 );
		var control = 0.25;

		var half = dist * control;

		var bb = bezierBoundingBox( p1[ 0 ] - x, p1[ 1 ] - y,
			p1[ 0 ] - x - half, p1[ 1 ] - y,
			p2[ 0 ] - x + half, p2[ 1 ] - y,
			p2[ 0 ] - x, p2[ 1 ] - y );

		element.style.left = x + bb.min.x - 0.5 * thick;
		element.style.top = y;
		element.width = bb.max.x - bb.min.x + 2 * thick;
		element.height = h;

		ctx = element.getContext("2d" );

		ctx.strokeStyle = color;
		ctx.lineCap = "round";
		ctx.lineWidth = thick;
		ctx.beginPath();
		ctx.moveTo( p1[ 0 ] - x - bb.min.x + 0.5 * thick, p1[ 1 ] - y );
		ctx.bezierCurveTo( p1[ 0 ] - x - half - bb.min.x + 0.5 * thick, p1[ 1 ] - y,
			p2[ 0 ] - x + half - bb.min.x + thick, p2[ 1 ] - y,
			p2[ 0 ] - x - bb.min.x + thick, p2[ 1 ] - y );

		// ctx.lineTo(p2[0]-x,p2[1]-y);
		ctx.stroke();
	};

	this.remove = function() {
		canvDiv.removeChild( element );
	};
};

function computeWireDistance( a, b ) {
	// connection going forward
	var df = 100;
	const sf = 2;
	// connection going backwards
	var db = 600;
	const sb = 4;
	// transition threshold
	const th = 300;

	var d = Math.dist( a[ 0 ], a[ 1 ], b[ 0 ], b[ 1 ] );
	// var d = b[0] - a[0];

	// fix distance
	df = df + (d - df) / sf;
	db = db + (d - db) / sb;

	if ( a[ 0 ] < b[ 0 ] ) { // forward
		d = df;
	} else if ( a[ 0 ] > b[ 0 ] + th ) { // backwards
		d = db;
	} else { // transition
		var t = (a[ 0 ] - b[ 0 ]) / th;
		d = (1 - t) * df + t * db;
	}

	return d;
}

function mkWire( n1, p1, n2, p2, color ) { // link p1 (output) to p2 (input)
	if ( !n1.outputs[ p1 ] || !n2.inputs[ p2 ] ) {
		return;
	}

	if ( isFinite( color ) ) {
		color = "hsl(" + color + ", 50%, 55%)";
	}

	// unlink existing?

	// link nodes
	n2.inputs[ p2 ].src = n1.outputs[ p1 ];
	n2.inputs[ p2 ].srcPort = p1;

	// make wire and do more linking!

	var newWire = new Wire( n2.inputs[ p2 ].pt, n1.outputs[ p1 ].pt, color );

	n1.outputs[ p1 ].flag = 1;

	n2.widget.inWires[ p2 ] = newWire;

	if ( !n1.widget.outWires[ p1 ] ) {
		n1.widget.outWires[ p1 ] = [];
	}

	n1.widget.outWires[ p1 ].push( newWire );

	n1.widget.redraw();
	n2.widget.redraw();
	newWire.redraw();
}

// n1
function rmWire( n2, p2 ) {
	if ( !n2.inputs[ p2 ] ) {
		return;
	}

	var n1 = n2.inputs[ p2 ].src.node;
	var p1 = n2.inputs[ p2 ].srcPort;

	// n2.inputs[p2].src={val:n2.inputs[p2].src.val,flag:0};
	// n2.inputs[p2].srcPort=null;

	var wire = n2.widget.inWires[ p2 ];
	delete n2.widget.inWires[ p2 ];

	wire.remove();

	for ( var ii in n1.widget.outWires[ p1 ] ) {
		if ( n1.widget.outWires[ p1 ][ ii ] == wire ) {
			n1.widget.outWires[ p1 ].splice( ii, 1 );
		}
	}

	n2.inputs[ p2 ].src = { val:n2.inputs[ p2 ].src.val, flag:-1 };
	// n2.inputs[p2].node=null;

	n1.widget.redraw();
	n2.widget.redraw();
}

// http://stackoverflow.com/a/34882840/1436359
function bezierBoundingBox( x0, y0, x1, y1, x2, y2, x3, y3 ) {
	var tvalues = [], xvalues = [], yvalues = [],
	a, b, c, t, t1, t2, b2ac, sqrtb2ac;
	for ( var i = 0; i < 2; ++i ) {
		if ( i == 0 ) {
			b = 6 * x0 - 12 * x1 + 6 * x2;
			a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
			c = 3 * x1 - 3 * x0;
		} else {
			b = 6 * y0 - 12 * y1 + 6 * y2;
			a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
			c = 3 * y1 - 3 * y0;
		}
		if ( Math.abs( a ) < 1e-12 ) {
			if ( Math.abs( b ) < 1e-12 ) {
				continue;
			}
			t = -c / b;
			if ( 0 < t && t < 1 ) {
				tvalues.push( t );
			}
			continue;
		}
		b2ac = b * b - 4 * c * a;
		if ( b2ac < 0 ) {
			continue;
		}
		sqrtb2ac = Math.sqrt( b2ac );
		t1 = (-b + sqrtb2ac) / (2 * a);
		if ( 0 < t1 && t1 < 1 ) {
			tvalues.push( t1 );
		}
		t2 = (-b - sqrtb2ac) / (2 * a);
		if ( 0 < t2 && t2 < 1 ) {
			tvalues.push( t2 );
		}
	}

	var j = tvalues.length, mt;
	while ( j-- ) {
		t = tvalues[ j ];
		mt = 1 - t;
		xvalues[ j ] = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
		yvalues[ j ] = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
	}

	xvalues.push( x0, x3 );
	yvalues.push( y0, y3 );

	return {
	min: { x: Math.min.apply( 0, xvalues ), y: Math.min.apply( 0, yvalues ) },
	max: { x: Math.max.apply( 0, xvalues ), y: Math.max.apply( 0, yvalues ) }
	};
}

function sigmoid( t ) {
	return 1 / (1 + Math.pow( Math.E, -t ));
}
