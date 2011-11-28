
var Widget=function Widget(node){
	
	var drawVals=true;
	
	this.title="";
	
	this.x=20;
	this.y=40;
		
	this.w=120;
	this.h=80;
	
	var showXbox=false;
	
	var div=document.createElement('div');
	canvDiv.appendChild(div);	
	div.className='node';

	if(showXbox){
		var xbox=document.createElement('div');
		xbox.className='xbox';
		xbox.innerHTML='x';
		div.appendChild(xbox);
			
		xbox.onmousedown=function(){
			node.remove();
		}
	}

	var canvas=document.createElement('canvas');
	div.appendChild(canvas);	
	var ctx;
	canvas.style['pointer-events']='none';
	
	var portSpacing=15;
	var portMargin=12;
	var portR=3.5;
	var titleHeight=14;
		
	var drawn=false;
	
	var hue=200;
	
	this.box=document.createElement('div');
	div.appendChild(this.box);	
		
	this.box.className='nodeBox';
	this.box.style.position='absolute';
	//this.box.style.width='0px';
	//this.box.style.height='0px';
	this.box.style.top='20px';
	this.box.style.left='10px';

//	var inPorts={}; //locations of ports
//	var outPorts={};
	
	//this.outPorts=outPorts;
	
	this.inWires={}; //Wire objects
	this.outWires={};
	
	var iLabels={};
	var oLabels={};	
	
	this.makeLabels=function makeLabels(){
		for(var ii in node.inputs){
			var newLabel=document.createElement('div');
			newLabel.className='iLabel';
			div.appendChild(newLabel);
			newLabel.innerHTML=ii;
			iLabels[ii]=newLabel;
		}
		for(var ii in node.outputs){
			var newLabel=document.createElement('div');
			newLabel.className='oLabel';
			div.appendChild(newLabel);
			newLabel.innerHTML=ii;
			oLabels[ii]=newLabel;
		}
	}
	
	this.upLabels=function upLabels(){
		for(var ii in node.inputs){
			iLabels[ii].firstChild.data=ii+':'+formatVal(node.inputs[ii].src.val);
		}
		for(var ii in node.outputs){
			oLabels[ii].firstChild.data=ii+':'+formatVal(node.outputs[ii].val);
		}
	}
	
	this.makeLabels();
	
	this.resize=function(){
		
		var nDots=Math.max(objectSize(node.inputs),objectSize(node.outputs));
		
		var pHeight=portSpacing*(nDots+1)+(this.title?titleHeight:0);
		
		this.h=pHeight+this.box.clientHeight+(this.box.clientHeight?10:0);
		
		this.w=Math.max(120,this.box.clientWidth+20);
		
		this.box.style.top=pHeight;
		
		if(this.title && xbox) xbox.style.top='1px';

		div.style.width=this.w;
		div.style.height=this.h; 
		
		canvas.width=this.w;
		canvas.height=this.h;
		ctx = canvas.getContext('2d'); 
		
		//?
		if(this.width) //'cause at init, we can't draw yet.
			this.redraw();
	}
	
	var ths=this;
	
	
	var handleDown=function(e){
		

		var pt=getMouse(e);
		
		if(e.target.type=="textarea")
			return;
			
		if(e.target.type=="range")
			return;
		
		//console.log(e);
		
		if(e.altKey){
			if(selected.indexOf(node)==-1) //perhaps select() should do this...
				select(node);
			duplicate();
			return;
		}
		
		//if hovering an input port
		var prtn;
		if(prtn=hoverPorts(node.inputs,pt)){
			var prt=node.inputs[prtn];
			if(prt.src.node){
				var tmpWire=new Wire(pt,prt.src.pt);
				tmpWire.redraw();
				wiring=[prt.src.node,prt.srcPort,tmpWire,pt];
				rmWire(node,prtn);
				return;
			}
			
			//if hovering an output port
		}else if(prtn=hoverPorts(node.outputs,pt)){
			var prt=node.outputs[prtn];
			var tmpWire=new Wire(pt,prt.pt,'#555');
			wiring=[node,prtn,tmpWire,pt];
			return;
		}
		
		if(selected.indexOf(node)==-1){ //if this is not selected
			var oldSel=selected;
			selected=[];
			for(var ii in oldSel){
				oldSel[ii].widget.redraw();	
			}
			selected.push(node);
			ths.redraw();
		}
		dragging=selected;
	}
	
	
	//idk if this works at all.
	div.onmousedown=handleDown;
	div.ontouchmove=function(e){
		handleDown(e.targetTouches[0]);
	}
	
	div.onmouseup=function(e){
		if(wiring){
			var pt=getMouse(e);
	
			var prtn;
			if(prtn=hoverPorts(node.inputs,pt)){
				var prt=node.inputs[prtn];
				if(prt.src.node){
					rmWire(node,prtn);		  
				}
				mkWire(wiring[0],wiring[1],node,prtn,200);
				wiring[2].remove();
				wiring=false;
				//mkWire
			}	
		}
	}
	
	div.onclick=function(e){
		var pt=getMouse(e);
		
		var prtn;
		if(prtn=hoverPorts(node.inputs,pt)){
			var prt=node.inputs[prtn];
			if(!prt.src.node){
				var eBox=new EditBox(prt.pt,node.inputs[prtn].src.val,function(v){
					node.inputs[prtn].src.val=v;
					node.inputs[prtn].src.flag=-1;
				});
			}
		}
	}
	
	var hoverPorts=function(pts,pt){
		for(var ii in pts){
			var prt=pts[ii];
			if(Math.dist(prt.pt[0],prt.pt[1],pt[0],pt[1])<=portR+2){
				return ii;
			}
		}
		return false;
	}
	
	this.upLoc=function(newx,newy){
		this.x=newx||this.x;
		this.y=newy||this.y;
		
		div.style.top=this.y+'px';
		div.style.left=this.x+'px';
		
		var px=portMargin;
		var py=portSpacing+(this.title?titleHeight:0);
		for(var ii in node.inputs){
			var nin=node.inputs[ii];
			if(!nin.pt)nin.pt=[];
			nin.pt[0]=[px+this.x];
			nin.pt[1]=[py+this.y];
			
			if(iLabels[ii]){
				iLabels[ii].style.left=px+'px';
				iLabels[ii].style.top=py+'px';
			}

			py+=portSpacing;
		}
		px=this.w-px;
		py=portSpacing+(this.title?titleHeight:0);
		for(var ii in node.outputs){
			var nin=node.outputs[ii];
			if(!nin.pt)nin.pt=[];
			nin.pt[0]=px+this.x;
			nin.pt[1]=py+this.y;
			
			if(oLabels[ii]){
				oLabels[ii].style.right=portMargin+'px';
				oLabels[ii].style.top=py+'px';
			}
			
			py+=portSpacing
		}
		
		if(!drawn){
		   ths.redraw();   
		}
		
		this.redrawWires();
	}
	
	this.redraw=function(){
		
		var sel=selected.indexOf(node)!=-1;
		
		ctx.clearRect(0,0,this.w,this.h);
		
		ctx.fillStyle   = 'hsla(' + hue + ', 80%, 90%,.8)';
		ctx.strokeStyle = 'hsl(' + hue + ', 70%, '+(sel?35:40)+'%)';
		
		ctx.lineWidth = sel?4:2;
		roundRect(ctx,3,3,this.w-6,this.h-6,7,true,true);
		
		//ctx.fillStyle   = 'hsl(' + hue + ', 80%, 95%)';
		ctx.lineWidth=2;

		if(this.title){
			ctx.fillStyle   = 'hsla(' + hue + ', 80%, 97%,.9)';
			//ctx.lineWidth = 2;
			roundRect(ctx,3,3,this.w-6,titleHeight,7,true,false);
		
			ctx.font='11px sans-serif';
			ctx.textBaseline='top';
			ctx.textAlign='center';
			ctx.fillStyle='black';
			ctx.fillText(this.title,this.w/2,4);
		}

		ctx.font='10px sans-serif';

		// draw ports
		for(var ii in node.inputs){
			var x=node.inputs[ii].pt[0]-this.x;
			var y=node.inputs[ii].pt[1]-this.y;
			
			ctx.fillStyle=ths.inWires[ii]?ths.inWires[ii].color:'hsl(' + hue + ', 80%, 95%)';
			circle(ctx,x,y, portR);
			
//			ctx.textBaseline='middle';
//			ctx.textAlign='left';
//			ctx.fillStyle='black';
//			ctx.fillText(ii+(drawVals?(':'+formatVal(node.inputs[ii].src.val)):''),x+6,y);
		}
		for(var ii in node.outputs){
			var x=node.outputs[ii].pt[0]-this.x;
			var y=node.outputs[ii].pt[1]-this.y;

			ctx.fillStyle=(ths.outWires[ii]&&ths.outWires[ii].length)?ths.outWires[ii][0].color:'hsl(' + hue + ', 80%, 95%)';
			circle(ctx,x,y, portR);

//			ctx.textBaseline='middle';
//			ctx.textAlign='right';
//			ctx.fillStyle='black';
//			ctx.fillText(ii+(drawVals?(':'+formatVal(node.outputs[ii].val)):''),x-6,y);
		}
		drawn=true;
	}
	
	function formatVal(val){
		if(!isFinite(val))
			return val; //not number
		
		return ~~(val*100)/100
	}
	
	this.redrawWires=function redrawWires(){
		for(var ii in ths.inWires){
			//if(ths.inWires[ii])
				ths.inWires[ii].redraw();
		}	
		for(var ii in ths.outWires){
			for(var jj in ths.outWires[ii]){
				
				ths.outWires[ii][jj].redraw();
			}
		}
	}
	
	this.remove=function(){
		//if(canvDiv.contains(div)) //ff doesn't have this, also it shouldn't happen.
			canvDiv.removeChild(div);
	}
	
}

function EditBox(pt,cur,callback){
	var box=document.createElement('div');
	box.className='editBox';
	
	var input=document.createElement('input');
	box.appendChild(input);
	box.style.left=pt[0]+'px';
	box.style.top=pt[1]+'px';
	box.style.width=50+'px';
	
	input.style.width='100%';
	
	canvDiv.appendChild(box);
	
	ths=this;
	input.value=cur;
	input.select();
	input.focus();
	
	input.onchange=function(){
		ths.remove();
		callback(input.value);
	}
	
	this.remove=function(){
		if(canvDiv.contains(box)){
			//console.log(canvDiv.contains(box));
			try{
				canvDiv.removeChild(box);
			}catch(err){
				
			}
		}
	}
	
	input.onblur=function(){
	   ths.remove();   
	}
}

function circle(ctx,x,y,r){
	ctx.beginPath();
	ctx.arc(x,y,r, 0, Math.PI*2, false)
	ctx.stroke();
	ctx.fill();
}

// http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html
/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
	stroke = true;
  }
  if (typeof radius === "undefined") {
	radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
	ctx.stroke();
  }
  if (fill) {
	ctx.fill();
  }		
}
