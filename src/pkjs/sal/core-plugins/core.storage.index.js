//
// Index - This plugin manages a database of index data for all other plugins

import uuid from 'uuid';

export default class IndexPlugin {

	get ID() {
		return "core.storage.index";
	}

	get name() {
		return "Index";
	}

	get description() {
		return "Stores index data.";
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

		// Set properties
		this.sal = sal;
		this.loadPromise = null;

	}

	/** Open the database. @returns Promise to IndexDB */
	open() {

		// Check if loaded already
		if (this.loadPromise)
			return this.loadPromise;

		// Create load promise
		this.loadPromise = new Promise((onSuccess, onFail) => {

			// Open database
			var req = window.indexedDB.open("sal-index", 4);
			req.onerror = err => onFail("Unable to open the index database.");
			req.onsuccess = event => onSuccess(new IndexDB(event.target.result));

			// If we are upgrading the database, delete everything
			req.onupgradeneeded = event => {

				// Remove all stores
				var db = event.target.result;
				for (var store of db.objectStoreNames)
					db.deleteObjectStore(store);

				// Add new index store
				var indexes = db.createObjectStore("indexes", { keyPath: "id", autoIncrement: true });
				if (indexes) {

					// Created, now add indexes
					indexes.createIndex("url", "url", { unique: false });
					indexes.createIndex("property_value", ["property", "value"], { unique: false });
					indexes.createIndex("dateModified", "dateModified", { unique: false });

				}

				// Add new event store
				var events = db.createObjectStore("events", { keyPath: "id", autoIncrement: true });
				if (events) {

					// Created, now add indexes
					events.createIndex("url", "url", { unique: false });
					events.createIndex("url_type", ["url", "type"], { unique: false });
					events.createIndex("url_date", ["url", "date"], { unique: false });
					events.createIndex("dateModified", "dateModified", { unique: false });

				}

			}

		});

		// Done
		return this.loadPromise;

	}

}

/** Interacts with the index database */
class IndexDB {

	constructor(idb) {

		// Store properties
		this.idb = idb;
		this.idb.onerror = this.onError.bind(this);

	}

	onError(err) {
		console.warn("SAL DB: Error. ", err);
	}

	// Create a new index in the database.
	add(url, property, value) {

		// Create transaction
		var trans = this.idb.transaction("indexes", "readwrite");
		var store = trans.objectStore("indexes");
		store.put({
			id: url + "_" + property,
			url: url,
			property: property,
			value: value,
			dateModified: Date.now()
		});

	}

	// Create a new event in the database.
	addEvent(url, type, value, date, id) {

		// Create transaction
		var trans = this.idb.transaction("events", "readwrite");
		var store = trans.objectStore("events");
		store.put({
			id: id || uuid.v4(),
			url: url,
			type: type,
			value: value,
			date: date || Date.now()
		});

	}

	// Remove item from index
	remove(url, property) {

		// Check if removing entire URL or just a property
		if (property) {

			// Remove just a property
			var trans = this.idb.transaction("indexes", "readwrite");
			var store = trans.objectStore("indexes");
			store.delete(url + "_" + property);

		} else {

			// Get all keys for this url
			var trans = this.idb.transaction("indexes");
			var store = trans.objectStore("indexes");
			var index = store.index("url");
			var req = index.openCursor(IDBKeyRange.only(url));
			req.onerror = err => onFail("Unable to open index.");

			// Cursors are weird. OnSuccess is called once for each .continue() call, until cursor is null.
			var keysToDelete = [];
			req.onsuccess = event => {

				// Store property
				var cursor = event.target.result;
				if (cursor) {

					// We have a value, store it
					keysToDelete.push(cursor.key);

					// Get next value
					cursor.continue();

				} else {

					// Done, now delete keys
					var trans = this.idb.transaction("indexes", "readwrite");
					var store = trans.objectStore("indexes");
					for (var key of keysToDelete)
						store.delete(key);

				}

			}

		}

	}

	// Get all properties for a url. @returns Promise
	getProperties(url) {
		return new Promise((onSuccess, onFail) => {

			var trans = this.idb.transaction("indexes");
			var store = trans.objectStore("indexes");
			var index = store.index("url");
			var req = index.openCursor(IDBKeyRange.only(url));
			req.onerror = err => onFail("Unable to open index.");

			// Cursors are weird. OnSuccess is called once for each .continue() call, until cursor is null.
			var props = {};
			props.url = url;
			req.onsuccess = event => {

				// Store property
				var cursor = event.target.result;
				if (cursor) {

					// We have a value, store it
					props[cursor.value.property] = cursor.value.value;

					// Get next value
					cursor.continue();

				} else {

					// Done
					onSuccess(props);

				}

			}

		});
	}

	// Get single property for a url. @returns Promise
	getProperty(url, property) {
		return new Promise((onSuccess, onFail) => {

			var trans = this.idb.transaction("indexes");
			var store = trans.objectStore("indexes");
			var req = store.get(IDBKeyRange.only(url + "_" + property));
			req.onerror = e => onSuccess(null);
			req.onsuccess = e => onSuccess(e.target.result);

		});
	}

	// Get all events for a url. @returns Promise
	getEvents(url) {
		return new Promise((onSuccess, onFail) => {

			var trans = this.idb.transaction("events");
			var store = trans.objectStore("events");
			var index = store.index("url");
			var req = index.openCursor(IDBKeyRange.only(url));
			req.onerror = err => onFail("Unable to open index.");

			// Cursors are weird. OnSuccess is called once for each .continue() call, until cursor is null.
			var events = [];
			req.onsuccess = event => {

				// Store property
				var cursor = event.target.result;
				if (cursor) {

					// We have a value, store it
					events.push(cursor.value);

					// Get next value
					cursor.continue();

				} else {

					// Done
					onSuccess(events);

				}

			}

		});
	}

}
