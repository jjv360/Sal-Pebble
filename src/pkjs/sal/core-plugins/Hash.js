//
// Hash - Provides access to hashing functions

var SHA256 = require("crypto-js/sha256");

module.exports = function Hash() {

	// Properties
	this.ID = "core.security.hash";
	this.name = "Hashing functions";
	this.description = "Provides hashing functions.";
	this.version = 1;
	this.author = "jjv360";
	this.dependencies = [];

}

module.exports.prototype.sha256 = function(input) {
	return SHA256(input);
}
