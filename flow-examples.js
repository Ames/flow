
var examples = [
{
	name:"empty scene",
	scn:{
		nodes:{},
		wires:{}
	}
}, {
	name:"plot sines",
	scn:{
		nodes:[
			{ type:"Logger", x:500, y:200 }, // 0
			{ type:"Summer", x:200, y:100 }, // 1
			{ type:"Mouse", x:100, y:180 }, // 2
			{ type:"Time", x: 50, y:410 }, // 3
			{ type:"Sine", x: 50, y:300, i:{ freq:.5 } }, // 4
			{ type:"Sine", x:200, y:300, i:{ freq:4.05 } }, // 5
			{ type:"Scope", x:500, y:350 }, // 6
			{ type:"Custom", x:200, y:400 }, // 7
			{ type:"Multiply", x:350, y:150, i:{ b:2 } } // 8
		], wires:[
			{ n1:4, p1:"y", n2:5, p2:"amp", color:100 },
			{ n1:5, p1:"y", n2:6, p2:"y1", color:220 },

			{ n1:1, p1:"c", n2:8, p2:"a", color:0 },
			{ n1:8, p1:"c", n2:0, p2:"msg", color:100 },

			{ n1:3, p1:"t", n2:7, p2:"a", color:320 },
			{ n1:3, p1:"t", n2:6, p2:"x", color:320 },

			{ n1:7, p1:"x", n2:6, p2:"y2", color:0 },
			{ n1:7, p1:"y", n2:6, p2:"y3", color:100 }
		]
	}
}, {
	name:"SR latch",
	scn:{
		"nodes":[
			{ "type":"button", "title":"", "x":218, "y":178, "i":{} },
			{ "type":"button", "title":"", "x":216, "y":260, "i":{} },
			{ "type":"NOR", "title":"NOR", "x":384, "y":179, "i":{ "a":false, "b":false } },
			{ "type":"NOR", "title":"NOR", "x":384, "y":259, "i":{ "a":true, "b":false } }
		], "wires":[
			{ "n1":"0", "p1":"o", "n2":"2", "p2":"a", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"3", "p1":"y", "n2":"2", "p2":"b", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"1", "p1":"o", "n2":"3", "p2":"b", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"2", "p1":"y", "n2":"3", "p2":"a", "color":"hsl(200, 50%, 55%)" }
		]
	}
}, {
	name: "Lowpass Filter",
	scn:{
		"nodes":[
			{ "type":"IIR Lowpass", "title":"IIR Lowpass", "x":319, "y":178, "i":{ "x":-0.5, "factor":5 } },
			{ "type":"Scope", "title":"", "x":503, "y":84, "i":{ "x":305.3666666665533, "y1":-0.5, "y2":0.0786934336245304, "y3":0.22220657712058517 } },
			{ "type":"Square", "title":"Square", "x":141, "y":146, "i":{ "freq":1, "amp":1, "phase":1 } },
			{ "type":"Time", "title":"Time", "x":326, "y":25, "i":{} },
			{ "type":"IIR Lowpass", "title":"IIR Lowpass", "x":319, "y":244, "i":{ "x":-0.5, "factor":50 } },
			{ "type":"IIR Lowpass", "title":"IIR Lowpass", "x":323, "y":483, "i":{ "x":-0.16153112679525203, "factor":50 } },
			{ "type":"Scope", "title":"", "x":502, "y":332, "i":{ "x":305.3666666665533, "y1":-0.16153112679525203, "y2":0.13831566412069063, "y3":0.31089306339692424 } },
			{ "type":"IIR Lowpass", "title":"IIR Lowpass", "x":322, "y":415, "i":{ "x":-0.16153112679525203, "factor":5 } },
			{ "type":"Sine", "title":"Sine", "x":142, "y":371, "i":{ "freq":1, "amp":1, "phase":1 } },
			{ "type":"Mouse", "title":"Mouse", "x":150, "y":595, "i":{} },
			{ "type":"IIR Lowpass", "title":"IIR Lowpass", "x":326, "y":732, "i":{ "x":30, "factor":50 } },
			{ "type":"IIR Lowpass", "title":"IIR Lowpass", "x":325, "y":664, "i":{ "x":30, "factor":5 } },
			{ "type":"Scope", "title":"", "x":505, "y":581, "i":{ "x":305.3666666665533, "y1":30, "y2":30.0039596574512, "y3":192.62559132314706 } }
		], "wires":[
			{ "n1":"2", "p1":"y", "n2":"0", "p2":"x", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"3", "p1":"t", "n2":"1", "p2":"x", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"0", "p1":"y", "n2":"1", "p2":"y2", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"2", "p1":"y", "n2":"1", "p2":"y1", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"4", "p1":"y", "n2":"1", "p2":"y3", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"2", "p1":"y", "n2":"4", "p2":"x", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"8", "p1":"y", "n2":"5", "p2":"x", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"7", "p1":"y", "n2":"6", "p2":"y2", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"5", "p1":"y", "n2":"6", "p2":"y3", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"8", "p1":"y", "n2":"6", "p2":"y1", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"3", "p1":"t", "n2":"6", "p2":"x", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"8", "p1":"y", "n2":"7", "p2":"x", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"9", "p1":"x", "n2":"10", "p2":"x", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"9", "p1":"x", "n2":"11", "p2":"x", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"11", "p1":"y", "n2":"12", "p2":"y2", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"10", "p1":"y", "n2":"12", "p2":"y3", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"9", "p1":"x", "n2":"12", "p2":"y1", "color":"hsl(200, 50%, 55%)" },
			{ "n1":"3", "p1":"t", "n2":"12", "p2":"x", "color":"hsl(200, 50%, 55%)" }
		]
	}
} ];
