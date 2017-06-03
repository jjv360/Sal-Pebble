//
// Main class for the Sal UI plugin

var UIWindow = require("./UIWindow");

module.exports = function SalUIPlugin(sal) {

	// Properties
	this.ID = "core.ui";
	this.name = "User Interface";
	this.description = "Displays a user interface in the Pebble app.";
	this.version = 1;
	this.author = "jjv360";
	this.dependencies = [];
	this.capabilities = ["core.ui"];
	this.appContinuationURL = "";

	// Set properties
	this.sal = sal;

};

module.exports.prototype.load = function() {

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

};

module.exports.prototype.unload = function() {

	// Remove listener
	// window.removeEventListener("resize", this.boundLayout);

};

module.exports.prototype.clear = function() {

};

module.exports.prototype.alert = function(title, text) {

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

};

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

/** Open URL. NOTE: This will only work from within the context of Pebble's showConfiguration callback! */
module.exports.prototype.openURL = function(url) {
	
	// Check if in the show config context
	if (!window.PebbleShowConfigContext)
		return;
	
	// Add our params to the URL
	url += (url.indexOf("?") == -1 ? "?" : "&") + "s_eventMode=pebble";
	
	// Open it
	console.log("Opening: " + url);
	Pebble.openURL(url);
	
	// Return window instance
	return new UIWindow();
	
};

// /** Show content */
module.exports.prototype.show = function(info) {

	// Notify main window
	this.sal.triggerEvent("native.ui.content.show", info);

};

/** Play UI sound */
module.exports.prototype.playSound = function(name) {

	// // Find sound
	// var sound = this.sounds[name];
	// if (!sound)
	// 	return;
	//
	// // Play
	// sound.currentTime = 0;
	// sound.play();

};
