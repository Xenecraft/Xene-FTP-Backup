'use strict';
const Client = require('ftp');
const mkdirp = require('mkdirp');
const fs = require('fs');
const moment = require('moment');
const settings = require('./settings.js');

function downloadFTPFiles() {
  //Instantiate all temporary variables for this routine
  let c = new Client();
  let startTime = moment();
  let todayString = startTime.format('YYYY[.]MM[.]DD');
  let destinationPath = settings.COPY_PATH.destinationPath;
  let copyPath = settings.COPY_PATH.folderName;
  let finalDestinationPath = destinationPath + todayString;

  console.log('----------------------');
  console.log('Starting your backup!');
  console.log(`Your files will go into ${finalDestinationPath}`);
  console.log('----------------------');
  makeFolder(finalDestinationPath);

  c.on('ready', function() {
    c.list(copyPath, (err, list) => {
      if (err) throw err;
      list.forEach((item) => {
        if (item.type == '-')
          downloadFile(c, copyPath, item.name, finalDestinationPath);
        else {
          recursiveLookDown(c, copyPath + '/' + item.name, finalDestinationPath);
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

function downloadFile(c, filePath, fileName, finalDestinationPath) {
  let finalFile = filePath + '/' + fileName;
  makeFolder(finalDestinationPath + '\\' + filePath)
  c.get(finalFile, (err, stream) => {
    console.log('[Downloading]', finalFile);
    if (err) throw err;
    stream.once('close', function() {
      //Each file closes its own connection 	
    });
    stream.pipe(fs.createWriteStream(finalDestinationPath + '\\' + finalFile));
  })
}

function recursiveLookDown(c, topDirectory, finalDestinationPath) {
  c.list(topDirectory, (err, list) => {
    if (err) throw err;
    list.forEach((item) => {
      if (item.type == '-')
        downloadFile(c, topDirectory, item.name, finalDestinationPath);
      else
        recursiveLookDown(c, topDirectory + '/' + item.name, finalDestinationPath);
    });
  })
}

function finishFTPDownload(startTime, finalDestinationPath) {
  let endTime = moment();
  let totalTime = endTime.diff(startTime, 'minutes');
  let endTimeString = endTime.format('HH[:]mm[:]ss');

  console.log('----------------------');
  console.log(`The connection has closed. The time is currently ${endTimeString}.`);
  console.log('Your backup has finished:');
  console.log(`This operation took ${totalTime} minutes`);
  console.log(`Your backup is located in ${finalDestinationPath}`);
  console.log('----------------------');
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

// Uncomment to test the FTP Download without the cronjob.
//downloadFTPFiles();

module.exports = downloadFTPFiles;
