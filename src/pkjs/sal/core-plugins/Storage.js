//
// Storage - Provides client-side local storage of data

module.exports = class Storage {

	get ID() {
		return "core.storage";
	}

	get name() {
		return "Storage";
	}

	get description() {
		return "Provides local storage of data.";
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

	constructor(sal) {

		// Store Sal instance
		this.sal = sal;

	}

	/** Get a value from storage */
	get(scope, key) {
		try {
			return JSON.parse(localStorage[scope + "_" + key]);
		} catch (e) {
			return null;
		}
	}

	/** Put a value into storage */
	set(scope, key, value) {
		localStorage[scope + "_" + key] = JSON.stringify(value);
	}

}
