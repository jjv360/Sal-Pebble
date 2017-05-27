//
// Sal - Main class

var Request = require('./Request');
var UIPlugin = require('./core-plugins/UI');
var HashPlugin = require('./core-plugins/Hash');
var HTTPPlugin = require('./core-plugins/HTTP');
var localforage = require('localforage');

module.exports = class Sal {

	constructor(appID) {

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

	}

	loadLocalPlugins() {

		// Load core plugins
		var pluginLoad = Plugin => this.addPlugin(new Plugin.default(this));
		require(["./core-plugins/UI"], pluginLoad);
		require(["./core-plugins/Hash"], pluginLoad);
		require(["./core-plugins/HTTP"], pluginLoad);
		require(["./core-plugins/Storage"], pluginLoad);
		require(["./core-plugins/core.cron"], pluginLoad);
		require(["./core-plugins/com.jjv360.native-location-html5"], pluginLoad);

		// Load plugins from cache
		this.pluginDataCache.iterate((value, key) => {

			// Run plugin
			var plugin = this.runPlugin(value);

		});

	}

	loadRemotePlugins() {

		console.debug("SAL: Fetching plugin list");
		Request.get("/plugins/list").then((items) => {

			// Load plugins
			for (var pluginInfo of items)
				this.loadRemotePlugin(pluginInfo);

		}).catch((error) => {

			console.warn("SAL: Unable to fetch plugins. " + error.errorText);

		});

	}

	loadRemotePlugin(info) {

		// Stop if not valid
		if (!info.valid)
			return;

		// Stop if we have it already
		for (var p of this.plugins)
			if (p.ID == info.id && p.version == info.version)
				return;

		// Download it
		console.debug("SAL: Downloading plugin " + info.id + " version " + info.version);
		Request.download(info.url).then(js => {

			// Execute plugin
			var plugin = this.runPlugin(js);

			// Everything went well, store plugin code for offline access
			this.pluginDataCache.setItem(plugin.ID, js).then(() => {
				console.debug("SAL: Stored plugin data for " + plugin.ID);
			});

		}).catch(err => {

			// Failed
			console.warn("SAL: Unable to load plugin from " + info.url);
			console.warn(err);

		});

	}

	runPlugin(code) {

		// Execute code
		var module = {};
		module.exports = {};
		eval(code);

		// Create plugin instance
		var newPlugin = new module.exports(this);

		// Add new plugin
		this.addPlugin(newPlugin);
		return newPlugin;

	}

	addPlugin(plugin) {

		// Set state
		plugin._isLoaded = false;
		plugin._waitingForDependencies = true;

		// Remove existing plugin
		this.removePlugin(plugin.ID);

		// Add new plugin
		this.plugins.push(plugin);

		// Check plugin dependencies before loading
		this.checkPluginDependencies(plugin);

	}

	checkAllPluginDependencies() {

		for (var plugin of this.plugins)
			this.checkPluginDependencies(plugin);

	}

	checkPluginDependencies(plugin) {

		// Stop if already loaded
		if (plugin._isLoaded)
			return;

		// Check if all dependencies are loaded
		for (var depID of plugin.dependencies || []) {

			// Check if loaded
			var dep = this.getPlugin(depID);
			if (!dep || !dep._isLoaded)
				return;

		}

		// Load
		plugin.load && plugin.load(this);
		plugin._isLoaded = true;
		plugin._waitingForDependencies = false;
		console.debug("SAL: Loaded plugin " + plugin.ID);

		// Send resume message
		plugin.resume && plugin.resume(this);

		// Check all dependencies again
		this.checkAllPluginDependencies();

	}

	getPlugins() {

		// Find all loaded plugins
		var all = [];
		for (var plugin of this.plugins)
			if (plugin._isLoaded)
				all.push(plugin);

		// Done
		return all;

	}

	getPlugin(id) {

		// Find and return plugin
		for (var plugin of this.plugins)
			if (plugin.ID == id)
				return plugin;

	}

	getPluginWithCapability(capability) {

		// Find and return plugin
		for (var plugin of this.plugins)
			if (plugin.capabilities && plugin.capabilities.includes(capability))
				return plugin;

	}

	removePlugin(id) {

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

	}

	triggerEvent(name, value) {

		// Forward events to all plugins
		console.log("SAL: Event " + name + " triggered : " + value);
		for (var plugin of this.plugins)
			if (plugin._isLoaded && plugin.onEvent)
				plugin.onEvent(name, value);

		// Forward event to host listeners
		for (var listener of this.eventListeners)
			if (listener.event == name)
				listener.callback(value, name);

	}

	_outputText(text) {

		// Notify
		this.triggerEvent("core.speech.output", text);

	}

	addEventListener(event, callback) {
		this.eventListeners.push({ event: event, callback: callback });
	}

	removeEventListener(event, callback) {
		for (var i = 0 ; i < this.eventListeners.length ; i++) {
			if (this.eventListeners[i].event == event && this.eventListeners[i].callback == callback) {
				this.eventListeners.splice(i--, 1);
			}
		}
	}

}