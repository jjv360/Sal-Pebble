
export default class HTTP {

	get ID() {
		return "core.network.http";
	}

	get name() {
		return "HTTP Support";
	}

	get description() {
		return "Sends HTTP requests.";
	}

	get version() {
		return 1;
	}

	get author() {
		return "jjv360";
	}

	get dependencies() {
		return [];
	}

	constructor(sal) {

		// Set properties
		this.sal = sal;

	}

	/** Sends a GET HTTP request. @returns Promise */
	get(url, customHeaders) {
		return this.send("GET", url, null, customHeaders);
	}

	/** Sends a POST HTTP request. @returns Promise */
	post(url, body, customHeaders) {
		return this.send("POST", url, body, customHeaders);
	}

	/** Sends an HTTP request @returns Promise */
	send(method, url, body, customHeaders) {

		// Check vars
		customHeaders = customHeaders || {};

		// Check that body is a string
		if (typeof body == "object")
			body = JSON.stringify(body);

		// Return promise
		return new Promise((onSuccess, onFail) => {

			// Create XHR
			var xhr = new XMLHttpRequest();

			// Open request
			xhr.open(method, url);

			// Set headers
			for (var header in customHeaders)
				xhr.setRequestHeader(header, customHeaders[header]);

			// Send request
			xhr.send(body);

			// Add load handler
			xhr.onload = () => {
				onSuccess(xhr.responseText);
			}

			// Add error handler
			xhr.onerror = (err) => {
				onFail("Error " + xhr.status);
			}

		});

	}

}
