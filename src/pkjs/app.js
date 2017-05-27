//
// App's main Javascript file

// Includes
var Sal = require("./sal");

// Vars
var config = localStorage.config && JSON.parse(localStorage.config) || {};
var sal = new Sal("com.jjv360.PebbleSal");


/** Called when the app is launched on the watch */
Pebble.addEventListener("ready", function(e) {

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
	
		// Pass user's input to Sal
		console.log("User input: " + e.payload.text);
		sal.triggerEvent("core.input.text", e.payload.text);
	
	}

});


/** Called when Sal has some output to show to the user */
sal.addEventListener("core.speech.output", function(text) {
	
	// Show text on watch, send an app message
	console.log("Sal output: " + text);
	Pebble.sendAppMessage({
		action: "output-text",
		text: text
	});
	
});


/** Called when the user wants to configure the app. */
Pebble.addEventListener("showConfiguration", function(e) {

	// Launch settings page
	Pebble.openURL("https://sal-ai.appspot.com/apps/pebble-config/index.html#" + encodeURIComponent(JSON.stringify(config)));

});


/** Called when the user saves the config */
Pebble.addEventListener("webviewclosed", function(e) {

	// Check for data
	var newConfig = e.response && JSON.parse(e.response);
	if (!newConfig)
		return;

	// Save new config
	config = newConfig;
	localStorage.config = JSON.stringify(config);

});
