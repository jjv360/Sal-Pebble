//
// This class mixin allows you to add event listeners and trigger events on a class

function EventEmitter() {
}

/** Add an event listener */
EventEmitter.prototype.addEventListener = EventEmitter.prototype.on = function(name, callback) {

    // Add listener
    this._eventListeners = this._eventListeners || {};
    this._eventListeners[name] = this._eventListeners[name] || [];
    this._eventListeners[name].push(callback);

};

/** Triggers an event, calling all listeners */
EventEmitter.prototype.triggerEvent = EventEmitter.prototype.emit = function(name, data) {

    // Trigger listeners
    var listeners = this._eventListeners && this._eventListeners[name] || [];
    for (var i = 0 ; i < listeners.length ; i++)
        listeners[i](data);

};

/** @static Mixin the event emitter into another class */
EventEmitter.mixin = function(target) {

    // Copy functions
    var source = EventEmitter.prototype;
    for (var prop in source) {
        if (source.hasOwnProperty(prop) && prop != "constructor") {
            target[prop] = source[prop];
        }
    }

};

// Export it
module.exports = EventEmitter;
