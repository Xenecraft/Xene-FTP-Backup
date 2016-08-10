'use strict';
let connection = require('./connection.js');
// let dropboxSync = require('./cloud-sync.js'); 

connection(()=>{
	process.exit();
});