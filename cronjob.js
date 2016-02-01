var connection = require('./connection.js');
var CronJob = require('cron').CronJob;

console.log('Cronjob has been initiated');
var job = new CronJob('00 00 3 * * 0-6', ()=>{
	connection();
});

job.start();