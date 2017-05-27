//
// Speech Output - Handles outputting text-to-speech to the user

export default class SpeechOutput {

	get ID() {
		return "core.speech.output";
	}

	get name() {
		return "Speech Output";
	}

	get description() {
		return "Provides text-to-speech.";
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
		this.voice = null;
		this.voiceIdx = 999;

	}

	load() {

		// Create speech synthesis
		if (window.speechSynthesis) {
			this.speechSynthesis = window.speechSynthesis;
		}

		// Find best voices
		this.speechSynthesis.addEventListener("voiceschanged", this.pickVoice.bind(this));
		this.pickVoice();

	}

	pickVoice() {

		// Find best voice (nearer the top of the array is preferred)
		var niceVoices = [
			"Google US English"
		]

		for (var voice of this.speechSynthesis && this.speechSynthesis.getVoices() || []) {
			var idx = niceVoices.indexOf(voice.voiceURI);
			if (idx < 0) continue;
			if (idx < this.voiceIdx) {
				this.voice = voice;
				this.voiceIdx = idx;
			}
		}

		console.log("SpeechOutput: Picked voice", this.voice);

	}

	say(text) {

		// Send event
		this.sal.triggerEvent("core.speech.output", text);

	}

	onEvent(type, text) {

		// Check if ours
		if (type != "core.speech.output")
			return;

		// Speak text
		var utter = new SpeechSynthesisUtterance(text);
		utter.voice = this.voice;
		this.speechSynthesis.speak(utter);

	}

}
