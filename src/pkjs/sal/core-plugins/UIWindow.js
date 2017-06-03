
var EventEmitter = require("../EventEmitter");

module.exports = function UIWindow() {
	
	// Properties
	this.closed = false;
	
	// Bind to window close event
	Pebble.addEventListener("webviewclosed", this.onWindowClosed.bind(this));
	
};

module.exports.prototype.onWindowClosed = function(e) {
	
	// Mark closed
	if (this.closed) return;
	this.closed = true;
	
	// Emit event
	var events = e.response && JSON.parse(decodeURIComponent(e.response)) || [];
	console.log(events.length + " Events: ");
	for (var i = 0 ; i < events.length ; i++) {
		console.log(JSON.stringify(events[i]));
		this.emit("message", events[i]);
	}
	
};

EventEmitter.mixin(module.exports.prototype);