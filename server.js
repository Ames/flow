var http = require("http");
var	url = require("url");
var path = require("path");
var fs = require("fs");

var port = process.argv[2] || 8080;

var contentTypesByExtension = {
	'.html': "text/html",
	'.css':	"text/css",
	'.js':	 "text/javascript"
};

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;
	var filename = path.join(process.cwd(), uri);

	if (!fs.existsSync(filename)) {
		filename = path.join(process.cwd(), "node_modules/", uri);

		if(!fs.existsSync(filename)) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}
	}

	if (fs.statSync(filename).isDirectory()) filename += '/index.html';

	var file = fs.readFileSync(filename, "binary");

	if (file) {
		var headers = {};
		var contentType = contentTypesByExtension[path.extname(filename)];
		if (contentType) headers["Content-Type"] = contentType;
		response.writeHead(200, headers);
		response.write(file, "binary");
		response.end();
	} else {
		response.writeHead(500, {"Content-Type": "text/plain"});
		response.write(err + "\n");
		response.end();
	}

}).listen(parseInt(port, 10));

console.log("Static file server running at\n	=> http://localhost:" + port + "/\nCTRL + C to shutdown");