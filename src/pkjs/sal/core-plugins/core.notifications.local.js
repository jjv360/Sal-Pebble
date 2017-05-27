//
// Local Notifications - Provides ability to show notifications to the user while the browser is minimized

export default class LocalNotificationsPlugin {

	constructor() {

		// Properties
		this.futureTasks = {};

	}

	get ID() {
		return "core.notifications.local";
	}

	get name() {
		return "Local Notifications";
	}

	get description() {
		return "Provides ability to show notifications to the user while the browser is minimized.";
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
		return ["service.notifications.local"];
	}

	/** Show a notification soon. */
	showNotification(args) {

		// Check args
		args.id = args.id || Math.random();
		args.delay = args.delay || 0;

		// Request notification permission
		Notification.requestPermission();

		// Stop old task if there is one
		this.clearNotification(args.id);

		// Schedule task
		console.log("Local Notification: Starting timer for " + (args.delay) + "ms");
		this.futureTasks[args.id] = setTimeout(() => {

			// Remove our info
			this.clearNotification(args.id);

			// Create notification
			var notification = new Notification(args.title || "Sal", {
				body: args.text,
				tag: args.id,
				icon: args.iconURL,
				sound: args.soundURL
			});

			// Add listeners
			notification.onclick = args.onClick;

		}, args.delay);

	}

	/** Clears a pending notification */
	clearNotification(notificationID) {

		// Stop old task if there is one
		clearTimeout(this.futureTasks[notificationID]);
		delete this.futureTasks[notificationID];

	}

	/** Clears all pending notifications */
	clearNotifications() {

		// Clear all
		for (var id of this.futureTasks)
			clearTimeout(this.futureTasks[id]);

		// Reset array
		this.futureTasks = {};

	}

}
