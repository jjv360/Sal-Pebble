//
// Native Location - Provides access to the device's GPS for looking up location

export default class NativeLocation {

	get ID() {
		return "com.jjv360.native-location-html5";
	}

	get name() {
		return "Location (native)";
	}

	get description() {
		return "Provides access to the user's GPS hardware.";
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

	get services() {
		return ["service.location"];
	}

	serviceConnected() {
		return !!("geolocation" in navigator);
	}

	serviceBestAccuracy() {
		return 5;
	}

	serviceGetCoordinates(accuracy) {
		return new Promise((onSuccess, onFail) => {

			// Get options
			var opts = {
				enableHighAccuracy: accuracy > 5,
				timeout: accuracy > 5 ? 15000 : 5000,
				maximumAge: accuracy > 5 ? 5 * 60 * 1000 : 0
			}

			// Send Request
			navigator.geolocation.getCurrentPosition(data => {

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

			}, err => {

				// Failed
				var text = "Unable to get GPS location.";
				if (err.code == 1) text = "Location permission was denied.";
				if (err.code == 2) text = "Location information is unavailable.";
				if (err.code == 3) text = "Timed out trying to fetch location.";
				onFail(text);

			}, opts);

		})
	}

}
