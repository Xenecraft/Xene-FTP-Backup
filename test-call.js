'use strict';
let connection = require('./connection.js');
let logFilesSync = require('./cloud-sync.js'); 

connection(()=>{
	logFilesSync();
	// process.exit();
});