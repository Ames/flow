
var selectStart;
var selectBox;
var selected=[];

function makeLibrary(){
		
	var newTxt='Add:<ul>';
	
	for(var ii in nodeTypes){
		newTxt+='<li><a href="javascript:new nodeTypes.'+ii+'({})">'+ii+'</a></li>'
	}
	newTxt+='</ul>'
	
	document.getElementById('library').innerHTML=newTxt;	
}

function togglePlay(){
	play=!play;
	
	document.getElementById('playPause').innerHTML=play?'pause':'play';
}

function saveLocal(){
	localStorage.setItem('scene',JSON.stringify(exportNodes(nodes)));	
}

function openLocal(){
	deleteNodes(nodes);

	importNodes(JSON.parse(localStorage.getItem('scene')));
	curTime=0;
}


//function plotWidget
document.onkeydown=function keyDown(e){
	//console.log(e);
	
	if(e.target.type=="textarea")
		return;

	if(e.target.type=="text")
		return;
		
	switch(e.which){
		case 8: //backspace
			e.preventDefault();
			deleteNodes(selected);
			break;
			
		case 32: //space
			e.preventDefault();
			togglePlay();
			break;
			
		case 68: //d
			duplicate();
			break;
		case 67: //c
			copyNodes(selected);
			break;
		case 86: //v
			pasteNodes();
			break;
		case 88: //x
			cutNodes(selected);
			break;
		case 79: //o
			openLocal();
			break;
		case 83: //s
			saveLocal();
			break;
//		case 71: //g
//			dragging=selected;
//			break;
	}
}



document.onmousedown=function mouseDown(e){
	mouse=getMouse(e);
	//console.log(e);
	if(e.target.id=='container' ||e.target.nodeName== 'HTML'){ // probably won't work in ff
		if(!selectBox){
			selectBox=document.createElement('div');
			canvDiv.appendChild(selectBox);
			selectBox.className='selectBox';
		}
		selectStart=getMouse(e);
		doSelectBox();
	}	
}

function select(node){
	selected.push(node);
	node.widget.redraw();
}

function deselect(node){
	if(node){
		selected.splice(selected.indexOf(node),1);	
		node.widget.redraw();
	}else{
		for(var ii=selected.length-1;ii>=0;ii--){
			deselect(selected[ii]);
		}
	}
}

document.onmouseup=function mouseUp(e){
	mouse=getMouse(e);

	dragging=null;
	if(wiring){
		wiring[2].remove();
		wiring=null;
	}
	if(selectStart){
		doSelectBox();
		selectStart=false;
		selectBox.style.visibility='hidden';
	}
}

document.onmousemove=function mouseMove(e){
	
	newMouse=getMouse(e);

	if(dragging){
		var dx=newMouse[0]-mouse[0];
		var dy=newMouse[1]-mouse[1];
		for(var ii in dragging){
			dragging[ii].widget.x+=dx;
			dragging[ii].widget.y+=dy;
	   		dragging[ii].widget.upLoc();
		}
	}
	if(wiring){
	   wiring[3][0]=newMouse[0];   
	   wiring[3][1]=newMouse[1];  
	   wiring[2].redraw(); 
	}
	if(selectStart){
		selectBox.style.width=Math.abs(newMouse[0]-selectStart[0])+'px';
		selectBox.style.height=Math.abs(newMouse[1]-selectStart[1])+'px';
		selectBox.style.left=Math.min(newMouse[0],selectStart[0])+'px';
		selectBox.style.top=Math.min(newMouse[1],selectStart[1])+'px';
		selectBox.style.visibility='visible';
		doSelectBox();
	}	
	
	mouse=newMouse;

}

document.onblur=function(){
	dragging=null;
	if(selectStart){
		selectStart=false;
		selectBox.style.visibility='hidden';
	}
};


function doSelectBox(){
	var xMin=Math.min(mouse[0],selectStart[0])
	var xMax=Math.max(mouse[0],selectStart[0])
	var yMin=Math.min(mouse[1],selectStart[1])
	var yMax=Math.max(mouse[1],selectStart[1])
	
	//selected=[];
	
	for(var ii in nodes){
		var n=nodes[ii];
		var w=n.widget;
		var over=w.x<xMax && w.x+w.w>xMin && w.y<yMax && w.y+w.h>yMin;
		
		if(over && selected.indexOf(n)==-1){
			select(n);
		}else if(!over && selected.indexOf(n)!=-1){
			deselect(n);
		}
	}
	
	//figure out who is selected and select them
}
function deleteNodes(nodes){
	for(var i=nodes.length-1;i>=0;i--){
		var n=nodes[i]
		deselect(n);
		n.remove();
	}
}
function cutNodes(nodes){
	copyNodes(nodes);
	deleteNodes(nodes);
}
function copyNodes(nodes){
	var xNodes=exportNodes(nodes);
	for(var i in xNodes.nodes){
		xNodes.nodes[i].x-=mouse[0];
		xNodes.nodes[i].y-=mouse[1];
	}
	localStorage.setItem('pasteboard',JSON.stringify(xNodes));
}

function pasteNodes(){
	
	var xNodes=JSON.parse(localStorage.getItem('pasteboard'))
	
	for(var i in xNodes.nodes){
		xNodes.nodes[i].x+=mouse[0];
		xNodes.nodes[i].y+=mouse[1];
	}
	var newNodes=importNodes(xNodes);
	
	deselect();
	
	for(var i in newNodes){
		select(newNodes[i]);
	}
}

function exportNodes(theNodes){
	var nBuf=[]; //node buffer
	var wBuf=[]; //wire buffer
	
	for(var ii in theNodes){
		var n=theNodes[ii];
		nBuf.push(n.doExport());
		
		//sin1.widget.outWires.y[0]==sin2.widget.inWires.amp
				
		for(var n1 in n.widget.inWires){
			var w=n.widget.inWires[n1];
			
			for(var jj in theNodes){
				var n2=theNodes[jj];
				for(var n2o in n2.widget.outWires){
					for(var n2oi in n2.widget.outWires[n2o]){
						if(w==n2.widget.outWires[n2o][n2oi]){
							// found it!
							wBuf.push({n1:jj,p1:n2o,n2:ii,p2:n1,color:w.color});
						}
					}
				}
			}
		}
	}
	return {nodes:nBuf,wires:wBuf};
}


function importNodes(parcel){
	
	var newNodes=[];
	for(var iii in parcel.nodes){
		newNodes[iii]=makeNode(parcel.nodes[iii]);
	}	
	for(var ii in parcel.wires){
		var w=parcel.wires[ii];
		mkWire(newNodes[w.n1],w.p1,newNodes[w.n2],w.p2,w.color);
	}
	return newNodes;
}

function makeNode(o){
	return new nodeTypes[o.type](o);
}

function duplicate(){

	var buf=exportNodes(selected);

	deselect();
	
	for(var ii in buf.nodes){
		buf.nodes[ii].x+=10;	
		buf.nodes[ii].y+=10;	
	}
	
	deselect();
	var newNodes=importNodes(buf);

	for(var ii in newNodes){
		select(newNodes[ii]);
	}
	
	dragging=selected;
}

// http://www.quirksmode.org/js/events_properties.html
function getMouse(e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
	return [posx,posy];
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
}
