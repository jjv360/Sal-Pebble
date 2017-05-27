//
// Native Location - Provides access to the device's GPS for looking up location

module.exports = function NativeLocation() {

	this.ID = "com.jjv360.native-location-html5";
	this.name = "Location (native)";
	this.description = "Provides access to the user's GPS hardware.";
	this.version = 1;
	this.author = "jjv360";
	this.dependencies = [];
	this.services = ["service.location"];

};

module.exports.prototype.serviceConnected = function() {
	return !!("geolocation" in navigator);
};

module.exports.prototype.serviceBestAccuracy = function() {
	return 5;
};

module.exports.prototype.serviceGetCoordinates = function(accuracy) {
	return new Promise(function (onSuccess, onFail) {

		// Get options
		var opts = {
			enableHighAccuracy: accuracy > 5,
			timeout: accuracy > 5 ? 15000 : 5000,
			maximumAge: accuracy > 5 ? 5 * 60 * 1000 : 0
		};

		// Send Request
		navigator.geolocation.getCurrentPosition(function(data) {

			// Success
			onSuccess({
				latitude: data.coords.latitude,
				longitude: data.coords.longitude,
				altitude: data.coords.altitude,
				accuracy: data.coords.accuracy,
				altitudeAccuracy: data.coords.altitudeAccuracy,
				heading: data.coords.heading,
				speed: data.coords.speed
			});

		}, function(err) {

			// Failed
			var text = "Unable to get GPS location.";
			if (err.code == 1) text = "Location permission was denied.";
			if (err.code == 2) text = "Location information is unavailable.";
			if (err.code == 3) text = "Timed out trying to fetch location.";
			onFail(text);

		}, opts);

	});
	
};
