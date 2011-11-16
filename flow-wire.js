
var Wire=function Wire(p1,p2,color){
	
	var element=document.createElement('canvas');
	canvDiv.appendChild(element);	
	var ctx;
	element.style['pointer-events']='none';
	element.style.zIndex='-1';
	
	var thick=3.3;
	
	var margin=4;
	
	this.p1=p1;
	this.p2=p2;

	this.color=color;

	//x1,y1,x2,y2
	this.redraw=function(){
		
		var x=Math.min(p1[0],p2[0])-margin;
		var y=Math.min(p1[1],p2[1])-margin;
		
		var w=Math.abs(p1[0]-p2[0])+margin*2;
		var h=Math.abs(p1[1]-p2[1])+margin*2;
		
		element.style.top=y;
		element.style.left=x;
		element.width=w;
		element.height=h;

		var half=w/3*((p1[1]>p2[1])?1:2);
		
		ctx = element.getContext('2d');
		
		ctx.strokeStyle=color;
		ctx.lineCap='round';
		ctx.lineWidth=thick;
		ctx.beginPath();
		ctx.moveTo(p1[0]-x,p1[1]-y);
		ctx.bezierCurveTo(half,p1[1]-y,
						  half,p2[1]-y,
						  p2[0]-x,p2[1]-y);
		
		//ctx.lineTo(p2[0]-x,p2[1]-y);
		ctx.stroke();
	}
	
	this.remove=function(){
		canvDiv.removeChild(element);
	}
}

function mkWire(n1,p1,n2,p2,color){ // link p1 (output) to p2 (input)
	if(!n1.outputs[p1] || !n2.inputs[p2]) return;
	
	if(isFinite(color))
		color='hsl('+color+', 50%, 55%)';
	
	// unlink existing?
	
	//link nodes
	n2.inputs[p2].src=n1.outputs[p1];
	n2.inputs[p2].srcPort=p1;
	
	// make wire and do more linking!
	
	var newWire=new Wire(n2.inputs[p2].pt,n1.outputs[p1].pt,color);
	
	n1.outputs[p1].flag=1;
	
	n2.widget.inWires[p2]=newWire;
	
	if(!n1.widget.outWires[p1])
		n1.widget.outWires[p1]=[];
		
	n1.widget.outWires[p1].push(newWire);
	
	n1.widget.redraw();
	n2.widget.redraw();
	newWire.redraw();
}

//n1
function rmWire(n2,p2){
	if(!n2.inputs[p2]) return;
	
	var n1=n2.inputs[p2].src.node;
	var p1=n2.inputs[p2].srcPort;
	
	//n2.inputs[p2].src={val:n2.inputs[p2].src.val,flag:0};
	//n2.inputs[p2].srcPort=null;
	
	var wire=n2.widget.inWires[p2]
	delete n2.widget.inWires[p2];
	
	wire.remove();
	
	for(var ii in n1.widget.outWires[p1]){
		if(n1.widget.outWires[p1][ii]==wire){
			n1.widget.outWires[p1].splice(ii,1);
		}
	}
	
	n2.inputs[p2].src={val:n2.inputs[p2].src.val,flag:-1};
	//n2.inputs[p2].node=null;
	
	n1.widget.redraw();
	n2.widget.redraw();
}
