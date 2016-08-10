'use strict';
let connection = require('./connection.js');
// let dropboxSync = require('./dropboxSync.js'); 

connection(()=>{
	process.exit();
});