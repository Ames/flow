
var types=[
{type:'X2',
   	title:'*2',
   	i:{a:0},
   	o:{b:0},
   	f:function(i,o){
   		o.b=i.a*2;
   	}
},{type:'Logger',
	title:'console.log()',
	i:{msg:""},
	f:function(i,o){
		console.log(i.msg);
	}
},{type:'Summer',
	title:'Sum',
	i:{a:1,b:2},
	o:{c:3},
	f:function(i,o){
		o.c=parseFloat(i.a)+parseFloat(i.b);
	}
},{type:'Sine',
	title:'Sine',
	i:{freq:2,amp:1,phase:0},
	o:{y:0},
	step:function(i,o){
		o.y=Math.sin(curTime*Math.PI*2*parseFloat(i.freq)+parseFloat(i.phase))*i.amp;
	}
},{type:'Time',
	title:"Time",
	o:{t:0},
	step:function(i,o){
		o.t=curTime;
	}
},{type:'Mouse',
	title:"Mouse",
	o:{x:0,y:0},
	init:function(i,o,that){
		that.handleMove=function(e){
			var m=getMouse(e);
			that.widget.upLabels();
			o.x=m[0];
			o.y=m[1];
		};
		document.addEventListener('mousemove',that.handleMove,false);
	},
	remove:function(i,o,that){
		//document.removeEventListener('mousemove',that.handleMove);
	}
//	step:function(i,o,that){
//		o.x=mouse[0];
//		o.y=mouse[1];
//	}
},{type:'Scope',
	i:{x:0,y1:0,y2:0,y3:0},
	init:function(i,o,that){
		that._={};
		var _=that._;
		var box=that.widget.box;
		_=that._;
		_.w=300;
		_.h=150;
		box.style.width=_.w+'px';
		box.style.height=_.h+'px';
		box.style.backgroundColor='rgb(255,255,251)';
		//that.widget.resize();
		
		box.style.minWidth=20+'px';
		
		/*
		_.wField=document.createElement('div');
		box.appendChild(_.wField);
		
		_.wField.innerHTML='2';
		_.wField.style.top='-10px';
		_.wField.style.position='absolute';
		*/
		
		_.canv=document.createElement('canvas');
		_.ctx = _.canv.getContext('2d'); 
		box.appendChild(_.canv);
		
		box.style.resize='both';
		box.style.overflow='hidden';
		_.canv.style['pointer-events']='none';
		
		_.newDat=false;
				
		var pw=0,ph=0;
		box.onmousemove=function(){
			if(box.clientWidth!=pw || box.clientHeight!=ph){
				pw=box.clientWidth;
				ph=box.clientHeight;
				that.widget.resize();
				that.widget.upLoc();
				that.widget.redraw();
				
				pw=box.clientWidth;
				ph=box.clientHeight;
				
				_.w=pw;
				_.h=ph;

				 _.canv.width=_.w;
				 _.canv.height=_.h;
			}
		}

		var pDiv=box.parentNode;

		_.buffer=[];
		_.dMin=100000;
		_.dMax=-100000;
		
		_.colors=['#00A','#A00','#0A0'];

		box.ondblclick=function(){
			_.buffer=[];
			_.dMin=100000;
			_.dMax=-100000;
			
			that.eval();
		}
		
		that.widget.resize();
		
	},
	f:function(i,o,that){
		var _=that._;
		var newPt=[];
		for(var ii in i){
			newPt.push(i[ii]);
			if(ii!='x'){
				_.dMax=Math.max(i[ii],_.dMax);
				_.dMin=Math.min(i[ii],_.dMin);
			}
		}
		_.buffer.push(newPt);
		//_.dMax=Math.max(i.val,_.dMax);
		//_.dMin=Math.min(i.val,_.dMin);
	},
	draw:function(i,o,that){
		
		var _=that._;
		
		var ctx=_.ctx;
		ctx.clearRect(0,0,_.w,_.h);

		var ch=1;
		for(var p in i){

			ctx.beginPath();
			var px=0;
			var ii=Math.max(_.buffer.length-sps*2*10+1,0);
			for(;ii<_.buffer.length;ii++){
				
				//if(ii<_.buffer.length-fps*2*10)
				//	continue;
				
				var x=(_.buffer[ii][0]*_.w/2)%_.w;
				var y=(1-(_.buffer[ii][ch]-_.dMin)/(_.dMax-_.dMin))*_.h;
				
				if(x<px){
					ctx.moveTo(x,y);
				}else{
					ctx.lineTo(x,y);
				}
				px=x;
			}
			ctx.strokeStyle=_.colors[(ch-1)% _.colors.length];
			ctx.lineWidth='.6';
			ctx.stroke();
			ch++;
		}
		
		//buffer
	}
},{type:'Custom',
	title:'custom',
	i:{a:1},
	o:{x:0,y:0,z:0},
	init:function(i,o,that){
		var box=that.widget.box;
		that._={};
		var _=that._;
		_.w=200;
		_.h=80;
		//box.style.width=_.w+'px';
		//box.style.height=_.h+'px';
		var inp=document.createElement('textarea');
		
		//inp.style.minWidth='100px';
		//inp.style.maxWidth='300px';
		
		inp.style.width=_.w+'px';
		inp.style.height=_.h+'px';
		box.style['pointer-events']='auto';
		
		box.appendChild(inp);
		
		that.widget.resize();
		
//			box.resize=function(){
//				that.widget.resize();
//				that.widget.redraw();
//			}
		
		inp.onchange=function(){
			that.newCode(inp.value);
		}
		
		inp.value="o.x=Math.sin(3.1*Math.PI*i.a)\n	+Math.sin(7*Math.PI*i.a)/2-3;\n\no.y=Math.random()-6;\no.z=i.a % 1;";
		inp.onchange();
		
		var pw=0,ph=0;
		inp.onmousemove=function(){
			if(inp.clientWidth!=pw || inp.clientHeight!=ph){
				pw=inp.clientWidth;
				ph=inp.clientHeight;
				that.widget.resize();
				that.widget.upLoc();
				that.widget.redraw();
				//that.widget.redrawWires();
				
				pw=inp.clientWidth;
				ph=inp.clientHeight;
			}
		}
	}
},{type:'hSlider',
	o:{o:0},
	init:function(i,o,that){
		var inp=document.createElement('input');
		inp.type='range';
		inp.min=-1;
		inp.max=1;
		inp.step=.001;
		that.widget.box.appendChild(inp);
		//that.widget.box.style.top='5px';
		that.widget.resize();
		inp.onchange=function(e){
			o.o=inp.value;
			that.widget.upLabels();
		}
	}
},{type:'Accel',
	title:'Accelerometer',
	o:{x:0,y:0},
	init:function(i,o,that){
		
		that.tilt=function tilt(or){
			o.x=or[0];
			o.y=or[1];
		}
		
		// http://stackoverflow.com/questions/4378435/how-to-access-accelerometer-gyroscope-data-from-javascript
		if (window.DeviceOrientationEvent) {
		    window.addEventListener("deviceorientation", function () {
		        that.tilt([event.beta, event.gamma]);
		    }, true);
		} else if (window.DeviceMotionEvent) {
		    window.addEventListener('devicemotion', function () {
		        that.tilt([event.acceleration.x * 2, event.acceleration.y * 2]);
		    }, true);
		} else {
		    window.addEventListener("MozOrientation", function () {
		        that.tilt([orientation.x * 50, orientation.y * 50]);
		    }, true);
		}

	}
}];


var nodeTypes={};

function makeTypes(){
	for(var i in types){
		nodeType(types[i]);
	}
}

//basically make a NodeType that inherits from Node
function nodeType(dArg){
	nodeTypes[dArg.type]=function NodeType(iArg){
		this.inherit=Node;
		this.inherit(dArg,iArg);
	}
}


