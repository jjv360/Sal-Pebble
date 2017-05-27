//
// Response - A possible response to user input

module.exports = class Response {

	constructor() {

		// Set properties
		this.confidence = 0;

		// Events
		this.execute = function() {
			console.log("SAL: Response execute block not set!");
		};

	}

}
