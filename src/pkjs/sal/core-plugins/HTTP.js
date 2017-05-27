
var Promise = require('promise');

module.exports = function HTTP(sal) {

	// Properties
	this.ID = "core.network.http";
	this.name = "HTTP Support";
	this.description = "Sends HTTP requests.";
	this.version = 1;
	this.author = "jjv360";
	this.dependencies = [];
	this.sal = sal;
	
};

/** Sends a GET HTTP request. @returns Promise */
module.exports.prototype.get = function(url, customHeaders) {
	return this.send("GET", url, null, customHeaders);
};

/** Sends a POST HTTP request. @returns Promise */
module.exports.prototype.post = function(url, body, customHeaders) {
	return this.send("POST", url, body, customHeaders);
};

/** Sends an HTTP request @returns Promise */
module.exports.prototype.send = function(method, url, body, customHeaders) {

	// Check vars
	customHeaders = customHeaders || {};

	// Check that body is a string
	if (typeof body == "object")
		body = JSON.stringify(body);

	// Return promise
	return new Promise(function(onSuccess, onFail) {

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
		xhr.onload = function() {
			onSuccess(xhr.responseText);
		};

		// Add error handler
		xhr.onerror = function(err) {
			onFail("Error " + xhr.status);
		};

	}.bind(this));

};