
// i: map of inputs with initial values
// o: map of outputs with initial values
// f: function called on new input f(i,o)
// step: function called every frame step(this)

var FlowNode = function FlowNode( dArg, iArg ) {

	this.inputs = {};
	this.outputs = {};

	var i = {};
	var o = {};

	this.type = dArg.type;

	this.vars = {}; // for type-specific variables

	for ( var ii in dArg.i ) {
		i[ ii ] = dArg.i[ ii ];
	}
	for ( var ii in dArg.o ) {
		o[ ii ] = dArg.o[ ii ];
	}

	for ( var ii in iArg.i ) {
		i[ ii ] = iArg.i[ ii ];
	}
	for ( var ii in iArg.o ) {
		o[ ii ] = iArg.o[ ii ];
	}

// var i=arg.i||{}; // inputs
// var o=arg.o||{}; // outputs

	var initF = dArg.init || null; // called once on init
	var stepF = dArg.step || null; // called every step, regardless of inputs
	var f = dArg.f || function() {}; // called on step when new data


	if ( dArg.vars ) {
		for ( var ii in dArg.vars ) {
			this.vars[ ii ] = dArg.vars[ ii ];
		}
	}
	if ( iArg.vars ) {
		for ( var ii in iArg.vars ) {
			this.vars[ ii ] = iArg.vars[ ii ];
		}
	}

	for ( var ii in i ) {
		this.inputs[ ii ] = { src:{ val:i[ ii ], flag:-1 } }; // -1 used for one-off updates
	}

	for ( var ii in o ) {
		this.outputs[ ii ] = { node:this, val:o[ ii ], flag:false };
	}

	this.newCode = function( str ) {
		var newF = new Function("i", "o", "that", str );
		newF( i, o, this );
		f = newF;
	};

	var widget = new Widget( this );

	// widget.redraw();

	widget.title = iArg.title || dArg.title || "";

	// widget.upLoc();
	widget.resize();


	if ( iArg.x && iArg.y ) {
		widget.upLoc( iArg.x, iArg.y );
	}

	this.widget = widget;

	var vChange = true; // values changed since last draw

	// this.redraw=widget.redraw;
	// this.resize=widget.resize;

	if ( initF ) {
		initF( i, o, this );
	}

	this.doExport = function() {
		var obj = {};
		obj.type = this.type;
		obj.title = this.widget.title;
		obj.x = this.widget.x;
		obj.y = this.widget.y;
		obj.i = {};
		for ( var ii in this.inputs ) {
			// if(!this.inputs[ii].src.node)
			var val = this.inputs[ ii ].src.val;

			if ( !isFinite( val ) ) {
				val = val.toString();
			}

			obj.i[ ii ] = val;
		}
		for ( var ii in this.vars ) {
			if ( !obj.vars ) {
				obj.vars = {};
			}

			obj.vars[ ii ] = this.vars[ ii ];
		}

		return obj;
	};

	this.draw = function() {
		if ( vChange ) {

			if ( dArg.draw ) {
				dArg.draw( i, o, this );
			}

			this.widget.upLabels();
			vChange = false;
		}
	};

	this.eval = function() {
		var run = false;

		// get new input values
		for ( var ii in i ) {
			if ( this.inputs[ ii ].src.flag ) {
				run = true;
				i[ ii ] = this.inputs[ ii ].src.val;
				if ( this.inputs[ ii ].src.flag == -1 ) {
					this.inputs[ ii ].src.flag = false;
				}

				vChange = true;
			}
		}

		if ( run ) {
			f( i, o, this );
			// this.widget.redraw(); // this is problematic.
		}


		if ( stepF ) {
			stepF( i, o, this );
			vChange = true;
			// this.widget.upLabels();
		}
	};

	this.progress = function progress() {
		for ( var ii in o ) {
			this.outputs[ ii ].flag = false;
			if ( o[ ii ] != this.outputs[ ii ].val ) {
				this.outputs[ ii ].val = o[ ii ];
				this.outputs[ ii ].flag = true;
				// this.widget.redraw();
				// this.widget.upLabels();
				vChange = true;
			}
		}
	};

	this.remove = function() {

		if ( dArg.remove ) {
			dArg.remove( i, o, this );
		}

		// unlink inputs
		for ( var ii in this.widget.inWires ) {
			rmWire( this, ii );
		};

		// unlink outputs
		// problem: how do we know who's connected to us.
		// one solution: search.
		for ( var n in nodes ) {
			var nod = nodes[ n ];
			for ( var inp in nod.inputs ) {
				if ( nod.inputs[ inp ].src.node && nod.inputs[ inp ].src.node == this ) {
					rmWire( nod, inp );
				}
			}
		}

		// remove from nodes[] (hopefully this won't cause problems)
		nodes.splice( nodes.indexOf( this ), 1 );

		// remove the widget
		this.widget.remove();
	};


	this.widget.upLoc();
	this.widget.redraw();
	nodes.push( this );
};
