//
// Main class for the Sal UI plugin

export default class SalUIPlugin {

	get ID() {
		return "core.ui";
	}

	get name() {
		return "User Interface";
	}

	get description() {
		return "Displays a user interface in the Pebble app.";
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

	get capabilities() {
		return ["core.ui"];
	}

	constructor(sal) {

		// Set properties
		this.sal = sal;

	}

	load() {

		// Load sounds
		// this.sounds = [];
		// this.sounds["warning"] = new Audio(require("./warning.wav"));
		// this.sounds["complete"] = new Audio(require("./complete.wav"));
		//
		// // Add listener
		// this.boundLayout = this.layout.bind(this);
		// window.addEventListener("resize", this.boundLayout);
		//
		// // Get resume state
		// this.resumeState = {};
		// if (window.location.hash) {
		//
		// 	// Extract params, from google api docs
		// 	var queryString = location.hash.substring(1), regex = /([^&=]+)=([^&]*)/g, m;
		// 	while (m = regex.exec(queryString)) {
		// 		var key = decodeURIComponent(m[1]);
		// 		var value = decodeURIComponent(m[2]);
		// 		this.resumeState[key] = value;
		// 		if (key == "state") {
		// 			try {
		// 				var json = JSON.parse(value);
		// 				for (var key in json) {
		// 					this.resumeState[key] = json[key];
		// 				}
		// 			} catch (e) {}
		// 		}
		// 	}
		//
		// 	// Done, remove hash
		// 	window.location.hash = "";
		//
		// }
		//
		// if (window.location.search) {
		//
		// 	// Extract params, from google api docs
		// 	var queryString = location.search.substring(1), regex = /([^&=]+)=([^&]*)/g, m;
		// 	while (m = regex.exec(queryString)) {
		// 		var key = decodeURIComponent(m[1]);
		// 		var value = decodeURIComponent(m[2]);
		// 		this.resumeState[key] = value;
		// 		if (key == "state") {
		// 			try {
		// 				var json = JSON.parse(value);
		// 				for (var key in json) {
		// 					this.resumeState[key] = json[key];
		// 				}
		// 			} catch (e) {}
		// 		}
		// 	}
		//
		// }

	}

	unload() {

		// Remove listener
		// window.removeEventListener("resize", this.boundLayout);

	}

	clear() {

	}

	alert(title, text) {

		// Create new alert window
		// var window = new Window(this, title);
		// window.setContent("<div class='alert-content'>" + text + "</div>");
		// window.show();
		//
		// // Add to window stack
		// this.windows.push(window);
		//
		// // Do layout
		// this.layout();
		//
		// // Done
		// return window;

	}

	// /** @private Layout active windows */
	// layout() {
	//
	// 	// Do layout soon
	// 	// clearTimeout(this._layoutTimer);
	// 	// this._layoutTimer = setTimeout(this._layout.bind(this), 1);
	//
	// }
	//
	// /** @private Layout */
	// _layout() {
	//
	// 	// Do layout
	//
	// }

	openURL(url) {

		// Open URL
		// window.location.href = url;

	}

	// // When doing OAuth etc, use this URL as the callback URL to reopen the app
	get appContinuationURL() {
		// var url = window.location.origin + window.location.pathname;
		// if (url.lastIndexOf("/") == url.length-1)
		// 	url = url.substring(0, url.length-1);
		// return url;
		return "";
	}

	// /** Show content */
	show(info) {

		// Notify main window
		this.sal.triggerEvent("native.ui.content.show", info);

	}

	/** Play UI sound */
	playSound(name) {

		// // Find sound
		// var sound = this.sounds[name];
		// if (!sound)
		// 	return;
		//
		// // Play
		// sound.currentTime = 0;
		// sound.play();

	}

}
