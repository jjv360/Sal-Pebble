//
// Response - A possible response to user input

module.exports = function Response() {

	// Set properties
	this.confidence = 0;

	// Events
	this.execute = function() {
		console.log("SAL: Response execute block not set!");
	};

};
