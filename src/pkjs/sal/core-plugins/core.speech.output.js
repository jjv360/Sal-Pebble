//
// Speech Output - Handles outputting text-to-speech to the user

module.exports = function SpeechInput(sal) {

	// Properties
	this.jobs = {};
	this.ID = "core.speech.output";
	this.name = "Speech Output";
	this.description = "Speech not supported, this is a stub.";
	this.version = 1;
	this.author = "jjv360";
	this.dependencies = [];
	this.sal = sal;

};

module.exports.prototype.say = function(text) {

	// Send event
	this.sal.triggerEvent("core.speech.output", text);

};
