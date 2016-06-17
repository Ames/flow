module.exports = function(results) {
	results.forEach(function(current) {
		if (!current.isEmpty()) {
			current.getErrorList().forEach(function(msg){
				console.log(current.getFilename() + ':' + msg.line + ':' + msg.column + ': warning: ' + msg.message);
			});
		}
	});
};