//
// Sal - Main class

var Request = require('./Request');
var Babel = require("babel-standalone");

module.exports = function Sal(appID) {

	// Set properties
	this.appID = appID;
	this.plugins = [];
	this.eventListeners = [];
	this.cachedPluginCode = {};

	// Events
	this.onoutput = null;

};

module.exports.prototype.init = function() {

	// Load plugins
	this.loadLocalPlugins();
	this.loadRemotePlugins();

};

module.exports.prototype.loadLocalPlugins = function() {

	// Load core plugins
	console.debug("SAL: Loading local plugins...");
	var pluginLoad = function(Plugin) { Plugin = Plugin && Plugin.default || Plugin; this.addPlugin( new Plugin(this)); }.bind(this);
	pluginLoad(require("./core-plugins/UI"));

	// Load code cache
	try {
		this.cachedPluginCode = JSON.parse(localStorage.plugincache) || {};
	} catch (e) {}

	// Load plugins from cache
	for (var key in this.cachedPluginCode) {

		// Run plugin
		var plugin = this.runPlugin(this.cachedPluginCode[key]);
		if (plugin)
			console.log("SAL: Loaded locally cached plugin " + plugin.ID + " version " + plugin.version);

	}

};

module.exports.prototype.loadRemotePlugins = function() {

	console.debug("SAL: Fetching plugin list");
	Request.get("/plugins/list").then(function(items) {

		// Load plugins
		this.triggerEvent("core.plugins.download-started", items.length);
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
		if (this.plugins[i].ID == info.id && this.plugins[i].version >= info.version)
			return;

	// Download it
	console.debug("SAL: Downloading plugin " + info.id + " version " + info.version);
	Request.download(info.url).then(function(js) {

		// ES5ify the code, since we're running on an ancient JavaScript system here :/
		js = Babel.transform(js, { presets: ['es2015'] }).code;

		// Execute plugin
		var plugin = this.runPlugin(js);
		if (!plugin)
			return console.warn("Plugin failed to execute! " + JSON.stringify(info));

		// Everything went well, store plugin code for offline access
		try {
			this.cachedPluginCode[plugin.ID] = js;
			localStorage.plugincache = JSON.stringify(this.cachedPluginCode);
			console.debug("SAL: Stored plugin data for " + plugin.ID);
		} catch(e) {
			console.log("SAL: Unable to store plugin code for " + plugin.ID);
		}

		// Notify
		this.triggerEvent("core.plugin.installed", plugin || {});

	}.bind(this)).catch(function(err) {

		// Failed
		console.warn("SAL: Unable to load plugin from " + info.url + ", " + err);
		console.warn(err);

	});

};

module.exports.prototype.runPlugin = function(code) {

	try {

		// Execute code
		var module = {};
		module.exports = {};
		eval(code);

		// Create plugin instance
		var newPlugin = new module.exports(this);

		// Add new plugin
		this.addPlugin(newPlugin);
		return newPlugin;

	} catch (e) {

		// Unable to run plugin!
		console.warn("SAL: Unable to execute plugin: " + e.message);

	}

};

module.exports.prototype.addPlugin = function(plugin) {

	// Set state
	plugin._isLoaded = false;
	plugin._waitingForDependencies = true;

	// Check if there's an existing plugin with a higher priority
	for (var i = 0 ; i < this.plugins.length ; i++) {
		var pl = this.plugins[i];
		if (plugin.ID == pl.ID && (plugin.priority || 0) > (pl.priority || 0)) {
			console.log("Plugin with lower priority skipped: " + plugin.ID);
			return;
		}
	}

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
	this.triggerEvent("core.plugin.loaded", plugin);

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
	for (var x = 0 ; x < this.eventListeners.length ; x++)
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
