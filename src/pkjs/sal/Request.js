//
// Request - Sends an API request

var SERVER_ADDRESS = "https://x41em8mtq8.execute-api.us-east-1.amazonaws.com/prod";

var Request = {

	get: function(endpoint) {

		// Send request
		return Request.sendRaw("GET", SERVER_ADDRESS + endpoint, null).then(function(xhr) {

			// Convert to JSON
			try {
				console.log("SAL: Converting response from JSON");
				var json = JSON.parse(xhr.responseText);

				// Get error
				if (json.errorCode)
					throw { errorCode: json.errorCode, errorText: json.errorText };

				// Done
				return json.payload;

			} catch (e) {
				throw { errorCode: "invalid-json", errorText: "Unable to parse response JSON. " + xhr.responseText };
			}

		});

	},

	download: function(url) {

		// Send request
		return Request.sendRaw("GET", url, null).then(function(xhr) {

			// Done
			return xhr.responseText;

		});

	},

	sendRaw: function(method, url, payload) {

		return new Promise(function (onSuccess, onFail) {

			// Send request
			var xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.send(payload);

			// On complete
			xhr.onreadystatechange = function () {

				// Wait until done
				if (xhr.readyState != 4)
					return;
				
				// Check if success
				console.log("XHR done: " + xhr.responseText);
				if (xhr.status >= 200 && xhr.status <= 399)
					onSuccess(xhr);
				else
					onFail({ errorCode: xhr.statusCode, errorText: "HTTP error " + xhr.status });

			};

		});

	}

};

module.exports = Request;
