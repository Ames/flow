module.exports = function (results) {
	var results = results || [];
	var errors = 0;
	var warnings = 0;
	var tooMany = false;
	var line;

	results.some(function (current) {
		current.messages.some(function (msg) {
			line = current.filePath;

			line+= ':' + (msg.line || 0) + ':' + (msg.column || 0) + ': ';

			if (msg.severity === 1) {
				line += 'warning';
				warnings++;
			}
			else if (msg.severity === 2) {
				line += 'error';
				errors++;
			}

			line += ': ' + msg.ruleId + ': ' + msg.message;

			console.log(line);

			if (errors === 20)
				tooMany = true;

			return tooMany;
		});
		return tooMany;
	});

	if (errors > 0 || warnings > 0) {
		line = '';

		if (tooMany)
			line = 'fatal error: too many errors emitted, stopping now.\n';

		if (warnings > 0) {
			line += warnings +' warning';
			if (warnings > 1) {
				line += 's';
			}
		}

		if (errors > 0 && warnings > 0)
			line += ' and ';

		if (errors > 0) {
			line += errors +' error';
			if (errors > 1) {
				line += 's';
			}
		}

		line += ' generated.';

		console.log(line);
	}
};