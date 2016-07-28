//
// App's main Javascript file

var SERVER_URL = "https://sal-ai.appspot.com/api";//"http://jjv360.me/sal/api";

// Get configuration
var config = localStorage.config && JSON.parse(localStorage.config) || {};



/** Called when the app is launched on the watch */
Pebble.addEventListener("ready", function(e) {
	
	// Fetch events from Sal, if any
	fetchEvents();
	
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
	if (e.payload.action == "process-text")
		processText(e.payload.text);
	else if (e.payload.action == "fetch-data")
		fetchEvents();
	
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


/** Gets a session ID for this user */
function getSessionID() {
	
	// Check if one exists in local storage
	if (localStorage.sid)
		return localStorage.sid;
	
	// Create one
	var length = 32;
	localStorage.sid = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	return localStorage.sid;
	
}


/** Sends text to Sal for processing. */
function processText(txt) {
	
	// Create payload
	var payload = JSON.stringify({
		sessionIdentifier: getSessionID(),
		event: "input",
		returnEvents: true,
		data: {
			type: "text",
			text: txt
		},
		setProperties: {
			"WA:APIKey": config.wolframAlphaAPIKey || "",
			"Pebble:TimelineToken": config.pebbleTimelineToken || "",
			"Client:TimezoneOffset": -(new Date().getTimezoneOffset())
		}
	});
	
	// Send request
	var xhr = new XMLHttpRequest();
	xhr.open("POST", SERVER_URL + "/send-event");
	xhr.send(payload);
	
	// Listen for completion
	xhr.onreadystatechange = function() {
		
		// Check if completed
		if (xhr.readyState != 4)
			return;
		
		// Start another fetch for events
		fetchEvents();
		
		// Process results
		var json = JSON.parse(xhr.responseText);
		if (!json)
			return;
		
		// Process events
		var events = json.events || [];
		events.forEach(function(event) {
			processIncomingEventData(event);
		});
		
	};
	
}


/** Fetches new events from Sal, such as a processed text response, etc. */
//var fetchTimeout = 0;
var isFetching = false;
function fetchEvents() {
	
	// Only do once
	if (isFetching) return;
	isFetching = true;
	
	// Do again shortly
	//clearTimeout(fetchTimeout);
	//fetchTimeout = setTimeout(fetchEvents, 5 * 1000);
	
	// Send request
	var xhr = new XMLHttpRequest();
	xhr.open("GET", SERVER_URL + "/event-source?sid=" + encodeURIComponent(getSessionID()) + "&once=true");
	xhr.send();
	
	// Listen for completion
	xhr.onreadystatechange = function() {
		
		// Check if completed
		if (xhr.readyState != 4)
			return;
		
		// Check for data
		isFetching = false;
		if (!xhr.responseText)
			return;
		
		// Process data, split into lines
		var data = "";
		xhr.responseText.split("\n").forEach(function(line) {
			
			// Check if blank line
			if (line.length === 0) {
				
				// Check if got data
				data = data.trim();
				if (data.length === 0)
					return;
				
				// Event split, process last event
				console.log("Event data: " + data);
				processIncomingEventData(JSON.parse(data));
				data = "";
				return;
				
			}
			
			// Check what line begins with
			if (line.substring(0, 5).toLowerCase() != "data:")
				return;
			
			// Append data to data
			data += line.substring(5).trim() + "\n";
			
		});
		
		// Check if still an event to parse
		data = data.trim();
		if (data.length > 0) {

			// Event split, process last event
			console.log("Event data: " + data);
			processIncomingEventData(JSON.parse(data));

		}
		
	};
	
}


/** Called when there is incoming data from Sal that needs processing */
function processIncomingEventData(data) {
	
	// Check if text output
	if (data.action == "output" && data.type == "text") {
		
		// Show text on watch, send an app message
		console.log("Sending response text to watch app: " + data.text);
		Pebble.sendAppMessage({
			action: "output-text",
			text: data.text
		});
		
	}
	
}