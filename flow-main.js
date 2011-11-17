
var canvDiv;

var flow;

var nodes=[];

var curTime=0;
var fps=60;
var sps=120;
//var t0=0;

var dragging=null;
var mouse=[0,0];

var wiring; // wire under consruction: [srcNode,srcPort,wire,pt]

var play=true;


var examples=[
{name:'plot sines',
 scn:{
		nodes:[
			{type:'Logger',x:500,y:200}, //0
			{type:'Summer',x:200,y:100}, //1
			{type:'Mouse' ,x:100,y:180}, //2
			{type:'Time'  ,x: 50,y:410}, //3
			{type:'Sine'  ,x: 50,y:300,i:{freq:.5}},  //4
			{type:'Sine'  ,x:200,y:300,i:{freq:4.05}},//5
			{type:'Scope' ,x:500,y:350}, //6
			{type:'Custom',x:200,y:400}, //7
			{type:'X2'    ,x:350,y:150}  //8
		],wires:[
			{n1:4,p1:'y',n2:5,p2:'amp',color:100},
			{n1:5,p1:'y',n2:6,p2:'y1' ,color:220},
			
			{n1:1,p1:'c',n2:8,p2:'a'  ,color:  0},
			{n1:8,p1:'b',n2:0,p2:'msg',color:100},
			
			{n1:3,p1:'t',n2:7,p2:'a'  ,color:320},
			{n1:3,p1:'t',n2:6,p2:'x'  ,color:320},

			{n1:7,p1:'x',n2:6,p2:'y2' ,color:0},
			{n1:7,p1:'y',n2:6,p2:'y3' ,color:100}
		]
	}
},{
name:'SR latch',
scn:{"nodes":[
		{"type":"button","title":"","x":218,"y":178,"i":{}},
		{"type":"button","title":"","x":216,"y":260,"i":{}},
		{"type":"NOR","title":"NOR","x":384,"y":179,"i":{"a":false,"b":false}},
		{"type":"NOR","title":"NOR","x":384,"y":259,"i":{"a":true,"b":false}}
	],"wires":[
		{"n1":"0","p1":"o","n2":"2","p2":"a","color":"hsl(200, 50%, 55%)"},
		{"n1":"3","p1":"y","n2":"2","p2":"b","color":"hsl(200, 50%, 55%)"},
		{"n1":"1","p1":"o","n2":"3","p2":"b","color":"hsl(200, 50%, 55%)"},
		{"n1":"2","p1":"y","n2":"3","p2":"a","color":"hsl(200, 50%, 55%)"}
	]}
}];

function init(){
	canvDiv=document.getElementById('container');
	
	makeTypes();
	
	//window.setInterval(step,1000/sps);
	//t0=Date.now()/1000;
	step();
	
	//window.setInterval(draw,1000/fps);
	
	//this is supposed to be better.
	(function animloop(){
      requestAnimFrame(animloop);
      draw();
    })();
	
	//loadScene(examples[1].scn);
	
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
	
//	canvDiv.onmousedown=function(e){
//		console.log(e);	
//	}

}


    

var draw=function draw(){
	if(play){
		//step();
		
		for(var ii in nodes){
			nodes[ii].draw();
		}
	}	
}

// main run loop
var step=function step(){
	//curTime=Date.now()/1000-t0;
	if(play){
		curTime+=1/sps;
		
		for(var ii in nodes){
			nodes[ii].eval();
		}
		for(var ii in nodes){
			nodes[ii].progress();  
		}
	
	}
	
	window.setTimeout(step,1000/sps);
}

//misc utility funcs

Math.dist=function(x1,y1,x2,y2){
	return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));	
}

objectSize = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function(/* function */ callback, /* DOMElement */ element){
      window.setTimeout(callback, 1000 / 60);
    };
})();

