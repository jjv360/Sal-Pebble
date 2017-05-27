//
// Speech Input - Handles listening for voice user input

export default class SpeechInput {

	get ID() {
		return "core.speech.input";
	}

	get name() {
		return "Speech Input";
	}

	get description() {
		return "Provides speech recognition input.";
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

	load() {

		// // Set properties
		// this.isRecording = false;
		//
		// // Create speech recognition
		// var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		// if (SpeechRecognition) {
		// 	this.speechRecognition = new SpeechRecognition();
		// 	this.speechRecognition.interimResults = true;
		// 	this.speechRecognition.lang = "en-US";
		// 	this.speechRecognition.onstart = this.onRecognitionStart.bind(this);
		// 	this.speechRecognition.onend = this.onRecognitionEnd.bind(this);
		// 	this.speechRecognition.onerror = this.onRecognitionError.bind(this);
		// 	this.speechRecognition.onnomatch = this.onRecognitionNoMatch.bind(this);
		// 	this.speechRecognition.onresult = this.onRecognitionResult.bind(this);
		// }

	}

	start() {

		// Start recording
		this.sal.triggerEvent("core.speech.input.start");

	}

	// onRecognitionStart() {
	// 	this.isRecording = true;
	// 	this.sal.triggerEvent("core.speech.input.started");
	// }
	//
	// onRecognitionEnd() {
	// 	this.isRecording = false;
	// 	this.sal.triggerEvent("core.speech.input.ended");
	// }
	//
	// onRecognitionError(e) {
	// 	this.sal.getPlugin("core.input").error("core.speech.input.unknown");
	// 	this.sal.triggerEvent("core.speech.input.error", e);
	// 	console.log("Recognition error");
	// 	console.warn(e);
	// }
	//
	// onRecognitionNoMatch() {
	// 	console.log("Recognition no match");
	// 	this.sal.getPlugin("core.input").error("core.speech.input.no-input");
	// }
	//
	// onRecognitionResult(e) {
	//
	// 	// Get highest confidence option
	// 	var result = null;
	// 	var alt = null;
	// 	for (var x = 0 ; x < e.results.length ; x++) {
	// 		for (var i = 0 ; i < e.results[x].length ; i++) {
	// 			if (!alt || alt.confidence < e.results[x][i].confidence) {
	// 				alt = e.results[x][i];
	// 				result = e.results[x];
	// 			}
	// 		}
	// 	}
	//
	// 	// Get output text
	// 	var isFinal = result.isFinal;
	// 	var text = alt.transcript;
	//
	// 	// Send event
	// 	this.sal.triggerEvent("core.speech.input." + (isFinal ? "final" : "partial"), text);
	//
	// 	// If final, process
	// 	if (isFinal)
	// 		this.sal.triggerEvent("core.input.text", text);
	//
	// }

	onEvent(type, text) {

		// Start recording on event
		// if (type == "core.speech.input.start")
		// 	if (!this.isRecording)
		// 		this.speechRecognition.start();

	}

}
