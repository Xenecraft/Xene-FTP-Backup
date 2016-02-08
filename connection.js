'use strict';
const Client = require('ftp');
const mkdirp = require('mkdirp');
const fs = require('fs');
const moment = require('moment');
const settings = require('./settings.js');

let c = new Client();
let startTime = moment();

function downloadFTPFiles() {
	let todayString = startTime.format('YYYY[.]MM[.]DD');
	let destinationPath = settings.COPY_PATH.destinationPath;
	let copyPath = settings.COPY_PATH.folderName;
	let finalDestinationPath = destinationPath + todayString;

  console.log('----------------------');
  console.log('Starting your backup!');
  console.log('----------------------');
  makeFolder(finalDestinationPath);

  c.on('ready', function() {
    c.list(copyPath, (err, list) => {
      if (err) throw err;
      list.forEach((item) => {
        if (item.type == '-')
          downloadFile(copyPath, item.name, finalDestinationPath);
        else {
          recursiveLookDown(copyPath + '/' + item.name, finalDestinationPath);
        }
      });
      c.end();
    });
  });

  c.on('end', () => {
    finishFTPDownload(startTime, finalDestinationPath);
  });

  c.connect(settings.CONNECTION_SETTINGS);
};

function downloadFile(filePath, fileName, finalDestinationPath) {
  let finalFile = filePath + '/' + fileName;
  makeFolder(finalDestinationPath + '\\' + filePath)
  c.get(finalFile, (err, stream) => {
    console.log('[Downloading]', finalFile);
    if (err) throw err;
    stream.once('close', function() {   
    	//Each file closes connection 	
    });
    stream.pipe(fs.createWriteStream(finalDestinationPath + '\\' + finalFile));
  })
}

function makeFolder(folderPath) {
  fs.access(folderPath, fs.F_OK, (err) => {
    if (err) {
      mkdirp(folderPath, (err2) => {
        if (err2)
          console.log('There was an error:', err2);
      });
    }
  })
}

function recursiveLookDown(topDirectory, finalDestinationPath) {
  c.list(topDirectory, (err, list) => {
    if (err) throw err;
    list.forEach((item) => {
      if (item.type == '-')
        downloadFile(topDirectory, item.name, finalDestinationPath);
      else
        recursiveLookDown(topDirectory + '/' + item.name, finalDestinationPath);
    });
  })
}

function finishFTPDownload(startTime, finalDestinationPath) {
  let endTime = moment();
  let totalTime = endTime.diff(startTime, 'minutes');
  let endTimeString = endTime.format('HH[:]mm[:]ss');
	console.log(`The connection has closed. The time is currently ${endTimeString}.`)
  console.log('----------------------');
  console.log('Your backup has finished:');
  console.log(`This operation took ${totalTime} minutes`);
  console.log(`Your backup is located in ${finalDestinationPath}`);
  console.log('----------------------');
}

// Uncomment to test the FTP Download without the cronjob.
//downloadFTPFiles();


module.exports = downloadFTPFiles;
