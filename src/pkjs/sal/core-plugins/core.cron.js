//
// Hash - Provides access to hashing functions

module.exports = function CronPlugin() {

	// Properties
	this.jobs = {};
	this.ID = "core.cron";
	this.name = "Cron Job Runner";
	this.description = "Executes cron jobs.";
	this.version = 1;
	this.author = "jjv360";
	this.dependencies = [];
	this.canRunInBackground = false;

}

/** Schedules a recurring task to execute, or updates an existing one if the taskID already exists. */
module.exports.prototype.schedule = function(taskID, pluginID, functionName, interval, repeatCount, customData) {

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
