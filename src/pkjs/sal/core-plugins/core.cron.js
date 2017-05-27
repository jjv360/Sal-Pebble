//
// Hash - Provides access to hashing functions

module.exports = class CronPlugin {

	constructor() {

		// Properties
		this.jobs = {};

	}

	get ID() {
		return "core.cron";
	}

	get name() {
		return "Cron Job Runner";
	}

	get description() {
		return "Executes cron jobs.";
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

	get canRunInBackground() {
		return false;
	}

	/** Schedules a recurring task to execute, or updates an existing one if the taskID already exists. */
	schedule(taskID, pluginID, functionName, interval, repeatCount, customData) {

		// Schedule task
		this.jobs[taskID] = {
			pluginID: pluginID,
			functionName: functionName,
			interval: interval,
			repeatCount: repeatCount,
			customData: customData,
			lastRun: Date.now()
		};

	}

}
