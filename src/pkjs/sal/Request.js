//
// Request - Sends an API request

var SERVER_ADDRESS = "https://x41em8mtq8.execute-api.us-east-1.amazonaws.com/prod";

module.exports = class Request {

	static get(endpoint) {

		// Send request
		return Request.sendRaw("GET", SERVER_ADDRESS + endpoint, null).then(xhr => {

			// Convert to JSON
			try {
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

	}

	static download(url) {

		// Send request
		return Request.sendRaw("GET", url, null).then(xhr => {

			// Done
			return xhr.responseText;

		});

	}

	static sendRaw(method, url, payload) {

		return new Promise((onSuccess, onFail) => {

			// Send request
			var xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.send(payload);

			// On success
			xhr.onload = function() {

				onSuccess(xhr);

			}

			// On fail
			xhr.onerror = function() {

				onFail({
					errorCode: xhr.statusCode,
					errorText: "HTTP error " + xhr.status
				});

			}

		});

	}

}
