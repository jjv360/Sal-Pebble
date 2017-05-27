//
// Storage - Provides client-side local storage of data

module.exports = function Storage(sal) {

	// Properties
	this.ID = "core.storage";
	this.name = "Storage";
	this.description = "Provides local storage of data.";
	this.version = 1;
	this.author = "jjv360";
	this.dependencies = [];

	// Store Sal instance
	this.sal = sal;

};

/** Get a value from storage */
module.exports.prototype.get = function(scope, key) {
	try {
		return JSON.parse(localStorage[scope + "_" + key]);
	} catch (e) {
		return null;
	}
};

/** Put a value into storage */
module.exports.prototype.set = function(scope, key, value) {
	localStorage[scope + "_" + key] = JSON.stringify(value);
};
