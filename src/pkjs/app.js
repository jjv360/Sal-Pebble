//
// App's main Javascript file

// Polyfill missing JS features
window.global = window;
require("babel-polyfill");
window.Promise = require('es6-promise').Promise;
window.btoa = require('base-64').encode;
window.atob = require('base-64').decode;
console.debug = console.debug || console.log;
console.info = console.info || console.log;
console.warning = console.warning || console.log;
console.error = console.error || console.log;

// Includes
var Sal = require("./sal");

// Vars
var config = localStorage.config && JSON.parse(localStorage.config) || {};
var sal = new Sal("com.jjv360.PebbleSal");
var waitingInput = null;


/** Called when the app is launched on the watch */
Pebble.addEventListener("ready", function(e) {
	
	// Setup Sal
	sal.init();
	checkLoaded();

	// Get timeline token
	Pebble.getTimelineToken(function (token) {

		// Got token, store it
		console.log("Got timeline token: " + token);
		config.pebbleTimelineToken = token;
		localStorage.config = JSON.stringify(config);

	}, function (error) {

		// Unable to get timeline token
		console.log('Error getting timeline token: ' + error);

	});

});


/** Called when an app message is received from the watch */
Pebble.addEventListener("appmessage", function(e) {

	// Check message action
	console.log("Got action request from Pebble app: " + JSON.stringify(e.payload));
	if (e.payload.action == "process-text") {
		
		// Check if not ready yet
		if (!isLoaded()) {
			waitingInput = e.payload.text;
			return;
		}
	
		// Pass user's input to Sal
		sal.triggerEvent("core.input.text", e.payload.text);
	
	}

});


/** Displays the text on the user's watch as Sal output */
function showText(text) {
	
	// Send message to watch
	Pebble.sendAppMessage({
		action: "output-text",
		text: text
	});
	
}


/** Called when Sal has some output to show to the user */
sal.addEventListener("core.speech.output", function(text) {
	
	// Show text on watch, send an app message
	console.log("Sal output: " + text);
	showText(text);
	
});


/** Called when Sal loads a plugin */
sal.addEventListener("core.plugin.loaded", checkLoaded);


/** Called when Sal installs a new plugin */
sal.addEventListener("core.plugin.installed", function(plugin) {
	
	// Notify
	console.log("Sending status: Installed " + plugin.name);
	Pebble.sendAppMessage({
		action: "status",
		text: "Installed " + plugin.name
	});
	
});


/** Called when Sal starts to download plugins */
// sal.addEventListener("core.plugins.download-started", function(count) {
	
// 	// Notify
// 	console.log("Sending status: Loading " + count + (count == 1 ? " plugin" : " plugins"));
// 	Pebble.sendAppMessage({
// 		action: "status",
// 		text: "Loading " + count + (count == 1 ? " plugin" : " plugins")
// 	});
	
// });


/** Called when the user wants to configure the app. */
window.PebbleShowConfigContext = false;
Pebble.addEventListener("showConfiguration", function(e) {
// 	return Pebble.openURL("https://google.com");
	
	// Mark as in the config context
	window.PebbleShowConfigContext = true;
	setTimeout(function() {
		window.PebbleShowConfigContext = false;
	}, 0);

	// Launch settings page
// 	Pebble.openURL("https://sal-ai.appspot.com/apps/pebble-config/index.html#" + encodeURIComponent(JSON.stringify(config)));
	
	// Find Settings plugin
	var Settings = sal.getPlugin("core.settings");
	if (!Settings)
		return showText("Sorry, I couldn't find the Settings plugin.");
	
	// Show settings
	Settings.show();

});


/** Called when the user saves the config */
// Pebble.addEventListener("webviewclosed", function(e) {

// 	// Check for data
// 	var newConfig = e.response && JSON.parse(e.response);
// 	if (!newConfig)
// 		return;

// 	// Save new config
// 	config = newConfig;
// 	localStorage.config = JSON.stringify(config);
// 	checkLoaded();

// });


/** Checksi f Sal is loaded yet */
function isLoaded() {
	return !!sal.getPlugin("core.InputHelper");
}


/** Called to send the watch app the ready event once the required Sal plugins have loaded */
function checkLoaded() {
	
	// Update settings
	var Storage = sal.getPlugin("core.storage");
	if (Storage) {
		
		// Pass config info to Sal storage
		Storage.set("com.jjv360.WolframAlpha", "appid", config.wolframAlphaAPIKey);
		
	}
	
	// Check if loaded
	if (!isLoaded())
		return;
	
	// Only do once
	if (window.hasLoaded) return;
	window.hasLoaded = true;
	
	// Send event
	console.log("Sal is ready!");
	Pebble.sendAppMessage({
		action: "ready"
	});
	
	// Send waiting input if ready
	if (waitingInput) sal.triggerEvent("core.input.text", waitingInput);
	waitingInput = null;
	
}
