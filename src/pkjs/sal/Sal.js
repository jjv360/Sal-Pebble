//
// Sal - Main class

var Request = require('./Request');
var localforage = require('localforage');
var Babel = require("babel-standalone");


module.exports = function Sal(appID) {

	// Set properties
	this.appID = appID;
	this.plugins = [];
	this.eventListeners = [];

	// Create localforage instance for plugin storage
	this.pluginDataCache = localforage.createInstance({ name: "sal-plugin-cache" });

	// Events
	this.onoutput = null;

	// Load plugins
	this.loadLocalPlugins();
	this.loadRemotePlugins();

};

module.exports.prototype.loadLocalPlugins = function() {

	// Load core plugins
	console.debug("SAL: Loading local plugins...");
	var pluginLoad = function(Plugin) { Plugin = Plugin && Plugin.default || Plugin; this.addPlugin( new Plugin(this)); }.bind(this);
	pluginLoad(require("./core-plugins/UI"));
	pluginLoad(require("./core-plugins/Hash"));
	pluginLoad(require("./core-plugins/HTTP"));
	pluginLoad(require("./core-plugins/Storage"));
	pluginLoad(require("./core-plugins/core.cron"));
	pluginLoad(require("./core-plugins/com.jjv360.native-location-html5"));

	// Load plugins from cache
	this.pluginDataCache.iterate(function (value, key) {

		// Run plugin
		this.runPlugin(value);

	}.bind(this));

};

module.exports.prototype.loadRemotePlugins = function() {

	console.debug("SAL: Fetching plugin list");
	Request.get("/plugins/list").then(function (items) {

		// Load plugins
		for (var i = 0 ; i < items.length ; i++)
			this.loadRemotePlugin(items[i]);

	}.bind(this)).catch(function(error) {

		console.warn("SAL: Unable to fetch plugins. " + error.errorText);

	}.bind(this));

};

module.exports.prototype.loadRemotePlugin = function(info) {

	// Stop if not valid
	if (!info.valid)
		return;

	// Stop if we have it already
	for (var i = 0 ; i < this.plugins.length ; i++)
		if (this.plugins[i].ID == info.id && this.plugins[i].version == info.version)
			return;

	// Download it
	console.debug("SAL: Downloading plugin " + info.id + " version " + info.version);
	Request.download(info.url).then(function(js) {

		// Execute plugin
		var plugin = this.runPlugin(js);

		// Everything went well, store plugin code for offline access
		this.pluginDataCache.setItem(plugin.ID, js).then(function() {
			console.debug("SAL: Stored plugin data for " + plugin.ID);
		});

	}.bind(this)).catch(function(err) {

		// Failed
		console.warn("SAL: Unable to load plugin from " + info.url);
		console.warn(err);

	});

};

module.exports.prototype.runPlugin = function(code) {
	
	// ES5ify the code, since we're running on an ancient JavaScript system here :/
	code = Babel.transform(code, { presets: ['es2015'] }).code;

	// Execute code
	var module = {};
	module.exports = {};
	eval(code);

	// Create plugin instance
	var newPlugin = new module.exports(this);

	// Add new plugin
	this.addPlugin(newPlugin);
	return newPlugin;

};

module.exports.prototype.addPlugin = function(plugin) {

	// Set state
	plugin._isLoaded = false;
	plugin._waitingForDependencies = true;

	// Remove existing plugin
	this.removePlugin(plugin.ID);

	// Add new plugin
	this.plugins.push(plugin);

	// Check plugin dependencies before loading
	this.checkPluginDependencies(plugin);

};

module.exports.prototype.checkAllPluginDependencies = function() {

	for (var i = 0 ; i < this.plugins.length ; i++)
		this.checkPluginDependencies(this.plugins[i]);

};

module.exports.prototype.checkPluginDependencies = function(plugin) {

	// Stop if already loaded
	if (plugin._isLoaded)
		return;

	// Check if all dependencies are loaded
	var deps = plugin.dependencies || [];
	for (var i = 0 ; i < deps.length ; i++) {

		// Check if loaded
		var dep = this.getPlugin(deps[i]);
		if (!dep || !dep._isLoaded)
			return;

	}

	// Load
	if (plugin.load) plugin.load(this);
	plugin._isLoaded = true;
	plugin._waitingForDependencies = false;
	console.debug("SAL: Loaded plugin " + plugin.ID);

	// Send resume message
	if (plugin.resume) plugin.resume(this);

	// Check all dependencies again
	this.checkAllPluginDependencies();

};

module.exports.prototype.getPlugins = function() {

	// Find all loaded plugins
	var all = [];
	for (var i = 0 ; i < this.plugins.length ; i++)
		if (this.plugins[i]._isLoaded)
			all.push(this.plugins[i]);

	// Done
	return all;

};

module.exports.prototype.getPlugin = function(id) {

	// Find and return plugin
	for (var i = 0 ; i < this.plugins.length ; i++)
		if (this.plugins[i].ID == id)
			return this.plugins[i];

};

module.exports.prototype.getPluginWithCapability = function(capability) {

	// Find and return plugin
	for (var i = 0 ; i < this.plugins.length ; i++)
		if (this.plugins[i].capabilities && this.plugins[i].capabilities.includes(capability))
			return this.plugins[i];

};

module.exports.prototype.removePlugin = function(id) {

	// Find it
	for (var i = 0 ; i < this.plugins.length ; i++) {

		// Check if ours
		if (this.plugins[i].ID != id)
			continue;

		// Unload
		if (this.plugins[i].unload)
			this.plugins[i].unload();

		// Remove
		console.debug("SAL: Unloaded plugin " + this.plugins[i].ID);
		this.plugins.splice(i--, 1);

	}

};

module.exports.prototype.triggerEvent = function(name, value) {

	// Forward events to all plugins
	console.log("SAL: Event " + name + " triggered : " + value);
	for (var i = 0 ; i < this.plugins.length ; i++)
		if (this.plugins[i]._isLoaded && this.plugins[i].onEvent)
			this.plugins[i].onEvent(name, value);

	// Forward event to host listeners
	for (var x = 0 ; i < this.eventListeners.length ; x++)
		if (this.eventListeners[x].event == name)
			this.eventListeners[x].callback(value, name);

};

module.exports.prototype._outputText = function(text) {

	// Notify
	this.triggerEvent("core.speech.output", text);

};

module.exports.prototype.addEventListener = function(event, callback) {
	this.eventListeners.push({ event: event, callback: callback });
};

module.exports.prototype.removeEventListener = function(event, callback) {
	for (var i = 0 ; i < this.eventListeners.length ; i++) {
		if (this.eventListeners[i].event == event && this.eventListeners[i].callback == callback) {
			this.eventListeners.splice(i--, 1);
		}
	}
};

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}
