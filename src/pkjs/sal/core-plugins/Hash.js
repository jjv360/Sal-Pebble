//
// Hash - Provides access to hashing functions

var SHA256 = require("crypto-js/sha256");

export default class Hash {

	get ID() {
		return "core.security.hash";
	}

	get name() {
		return "Hashing functions";
	}

	get description() {
		return "Provides hashing functions.";
	}

	get version() {
		return 1;
	}

	get author() {
		return "jjv360";
	}

	get dependencies() {
		return [];
	}

	sha256(input) {
		return SHA256(input);
	}

}
