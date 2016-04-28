var connection = require('./connection.js');
var CronJob = require('cron').CronJob;
var settings = require('./settings').CRON_TIME;

console.log('Cronjob has been initiated for', settings);
var job = new CronJob(settings, ()=>{
	connection(()=>{
		//You can queue the next task here!
	});
});

job.start();