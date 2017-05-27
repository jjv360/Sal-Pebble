//
// Speech Input - Handles listening for voice user input

module.exports = function SpeechInput() {

	// Properties
	this.jobs = {};
	this.ID = "core.speech.input";
	this.name = "Speech Input";
	this.description = "Provides speech recognition input.";
	this.version = 1;
	this.author = "jjv360";
	this.dependencies = [];

};

module.exports.prototype.start = function() {
	console.log("SpeechInput.start not implemeted!");
}
