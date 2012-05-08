
var types=[
{type:'Buffer',
	title:"",
	info:"output=input",
	i:{in_:0},
	o:{out:0},
	f:function(i,o){
		o.out=i.in_;
	}
},{type:'Logger',
	title:'console.log()',
	info:"Prints the input to the browser console.",
	i:{msg:""},
	f:function(i,o){
		console.log(i.msg);
	}
},{type:'Summer',
	title:'Sum',
	info:"c=a+b",
	i:{a:1,b:2},
	o:{c:3},
	f:function(i,o){
		o.c=1*i.a+1*i.b;
	}
},{type:'Multiply',
	title:'Multiply',
	info:"c=a*b",
	i:{a:1,b:2},
	o:{c:3},
	f:function(i,o){
		o.c=i.a*i.b;
	}
},{type:'Sine',
	title:'Sine',
	info:"Generates a sine wave",
	i:{freq:2,amp:1,phase:0},
	o:{y:0},
	step:function(i,o){
		o.y=Math.sin(curTime*Math.PI*2*parseFloat(i.freq)+parseFloat(i.phase))*i.amp;
	}
},{type:'Square',
	title:'Square',
	info:"Generates a square wave",
	i:{freq:2,amp:1,phase:0},
	o:{y:0},
	step:function(i,o){
		o.y=((Math.sin(curTime*Math.PI*2*parseFloat(i.freq)+parseFloat(i.phase))>0)-.5)*i.amp;
	}
},{type:'IIR Lowpass',
	title:'IIR Lowpass',
	info:"A simple lowpass filter",
	i:{x:0,factor:1},
	o:{y:0},
	step:function(i,o){
		 i.factor=parseFloat(i.factor);
		o.y=(o.y*i.factor+i.x)/(1+i.factor);
	}
},{type:'Time',
	title:"Time",
	info:"The current simulation time",
	o:{t:0},
	step:function(i,o){
		o.t=curTime;
	}
},{type:'Mouse',
	title:"Mouse",
	info:"The current mouse position",
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
	info:"Plots y vs. x",
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
		
		//we would store w and h in that.vars,
		// but there's this issue with webkit where user can't make it smaller.
		//  we might have to make our own resizable boxes :(
		
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
	info:"Evaluates Javascript code. Inputs are in (i), outputs go in (o).",
	i:{a:1,b:0,c:0},
	o:{x:0,y:0,z:0},
	vars:{txt:"o.x=Math.sin(3.1*Math.PI*i.a)\n	+Math.sin(7*Math.PI*i.a)/2-3;\n\no.y=Math.random()-6;\no.z=i.a % 1;"},
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
		
		inp.onkeyup=function(){
			that.vars.txt=inp.value;
			try{
				that.newCode(that.vars.txt);
				inp.style.backgroundColor='';
			}catch(err){
				ERR=err;
				inp.style.backgroundColor='#FDD';
			}
		}
		
		inp.value=that.vars.txt;
		inp.onkeyup();
		
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
	info:"Horizontal Slider",
	i:{i:0,min:0,max:1},
	o:{o:0},
	vars:{value:0},
	init:function(i,o,that){
		var inp=document.createElement('input');
		inp.type='range';
		
		inp.setRange=function(min,max){
			 var tmp=this.value;
	 		this.min=min;
	 		this.max=max;
			 this.step=(max-min)/1000;
			 this.value=tmp;
		}
		
		inp.setRange(i.min,i.max);
		
//		inp.min=0;
//		inp.max=1;
//		inp.step=.001;

		that.widget.box.appendChild(inp);
		//that.widget.box.style.top='5px';
		that.widget.resize();
		inp.value=that.vars.value;
		inp.onchange=function(e){
			that.vars.value=inp.value;
			o.o=inp.value;
			that.widget.upLabels();
		}
		that.inp=inp;
	},
	f:function(i,o,that){
		that.inp.setRange(i.min,i.max);
		
		that.inp.value=i.i;
		that.inp.onchange();
	}
},{type:'Accel',
	title:'Accelerometer',
	info:"Accelerometer data (if avalable)",
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
},{type:'check',
	title:'',
	info:"A Checkbox. Push to toggle.",
	i:{i:false},
	o:{o:false},
	vars:{checked:false},
	init:function(i,o,that){
		var inp=document.createElement('input');
		inp.type='checkbox';
		that.widget.box.appendChild(inp);
		//that.widget.box.style.top='5px';
		that.widget.resize();
		inp.checked=that.vars.checked;
		inp.onchange=function(e){
			that.vars.checked=inp.checked;
			o.o=(inp.checked);
			that.widget.upLabels();
		}
		that.inp=inp;
	},
	f:function(i,o,that){
		that.inp.checked=i.i;
		that.inp.onchange();
		o.o=i.i;
	}
},{type:'button',
	title:'',
	info:"A Button. On when pressed.",
	o:{o:false},
	init:function(i,o,that){
		var inp=document.createElement('input');
		inp.type='button';
		inp.value='press';
		that.widget.box.appendChild(inp);
		//that.widget.box.style.top='5px';
		that.widget.resize();
		inp.onmousedown=function(e){
			o.o=true;
			that.widget.upLabels();
		}
		inp.onmouseup=function(e){
			o.o=false;
			that.widget.upLabels();
		}
	}
},{type:'AND',
	title:'AND',
	info:"y = a && b",
	i:{a:0,b:0},
	o:{y:0},
	f:function(i,o,that){
		o.y=i.a && i.b;
	}
},{type:'OR',
	title:'OR',
	info:"y = a || b",
	i:{a:0,b:0},
	o:{y:0},
	f:function(i,o,that){
		o.y=i.a||i.b;
	}
},{type:'NAND',
	title:'NAND',
	info:"y = !( a && b )",
	i:{a:0,b:0},
	o:{y:0},
	f:function(i,o,that){
		o.y=!(i.a && i.b);
	}
},{type:'NOR',
	title:'NOR',
	info:"y = !( a || b )",
	i:{a:0,b:0},
	o:{y:0},
	f:function(i,o,that){
		o.y=!(i.a||i.b);
	}
},{type:'NOT',
	title:'NOT',
	info:"y = !a",
	i:{a:0},
	o:{y:0},
	f:function(i,o,that){
		o.y=!i.a;
	}
},{type:'XOR',
	title:'XOR',
	info:"y = ( a != b )",
	i:{a:0,b:0},
	o:{y:0},
	f:function(i,o,that){
		//o.y=(i.a!=i.b);
		o.y=(i.a<=0) != (i.b<=0);
		//o.y=i.a ^ i.b;
	}
},{type:'Topic',
	title:'Topic',
	info:"Sends data to ANY other node with the same 'Topic Name'",
	i:{val:0},
	o:{val:0},
	vars:{topic:""},
	init:function(i,o,that){
		var inp=document.createElement('input');
		inp.type='input';
		inp.value=that.vars.topic;
		inp.placeholder='Topic Name';
		that.widget.box.appendChild(inp);
		that.widget.resize();
		
		that.joinTopic=function(){
			
			if(that.vars.topic){
				
				var topic=that.vars.topic;
				
				socket.emit('joinTopic',topic);
				
				socket.on('connect',function(){
					socket.emit('joinTopic',topic); // re-join the topic.
				});	
				
				socket.on('disconnect',function(){
					inp.style.backgroundColor='#FED';
				});
				
				socket.on('joined',function(topic_){
					if(topic==topic_){
						inp.style.backgroundColor='#DFD';
						inp.blur();
					}
				});
				
				
				socket.on(topic,function(dat){
					o.val=dat;
				});
				
				if(!localSocket[topic]){
					localSocket[topic]=[];
				}
				localSocket[topic].push(function(dat){
					o.val=dat;
				});
			}
			
		}
		
		that.joinTopic();
		
		that.leaveTopic=function(){
			if(that.vars.topic){
				socket.emit('leaveTopic',that.vars.topic);
			}
		}
		
		inp.onchange=function(){
			inp.style.backgroundColor='#FFF';
			that.leaveTopic();
			
			if(inp.value){
				that.vars.topic=inp.value;
				that.joinTopic();
			}
		}
	},
	remove:function(i,o,that){
		that.leaveTopic();
		// we should fix localTopic too…
	},
	f:function(i,o,that){
		if(that.vars.topic){
			socket.emit(that.vars.topic,i.val);
			var funcs=localSocket[that.vars.topic];
			if(funcs){
				for(f in funcs){
					funcs[f](i.val); 
				}
			}
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


