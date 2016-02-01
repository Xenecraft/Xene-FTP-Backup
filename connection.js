'use strict';
var Client = require('ftp');
var mkdirp = require('mkdirp');
var fs = require('fs');
var moment = require('moment');
var settings = require('./settings.js');

const startTime = moment();
const todayString = startTime.format('YYYY[.]MM[.]DD');
const destinationPath = settings.COPY_PATH.destinationPath;
const copyPath = settings.COPY_PATH.folderName;
const finalDestinationPath = destinationPath + todayString;

var c = new Client();

function downloadFTPFiles() {
  console.log('----------------------');
  console.log('Starting your backup!');
  console.log('----------------------');
  makeFolder(finalDestinationPath);

  c.on('ready', function() {
    c.list(copyPath, (err, list) => {
      if (err) throw err;
      list.forEach((item) => {
        if (item.type == '-')
          downloadFile(copyPath, item.name);
        else {
          recursiveLookDown(copyPath + '/' + item.name);
        }
      });
      c.end();
    });
  });

  c.on('end', () => {
    finishFTPDownload();
  });

  c.connect(settings.CONNECTION_SETTINGS);
};

function downloadFile(filePath, fileName) {
  let finalFile = filePath + '/' + fileName;
  makeFolder(finalDestinationPath + '\\' + filePath)
  c.get(finalFile, (err, stream) => {
    console.log('[Downloading]', finalFile);
    if (err) throw err;
    stream.once('close', function() {
      c.end(finishFTPDownload);
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

function recursiveLookDown(topDirectory) {
  c.list(topDirectory, (err, list) => {
    if (err) throw err;
    list.forEach((item) => {
      if (item.type == '-')
        downloadFile(topDirectory, item.name);
      else
        recursiveLookDown(topDirectory + '/' + item.name);
    });
  })
}

function finishFTPDownload() {
  let endTime = moment();
  let totalTime = endTime.diff(startTime, 'minutes');
  console.log('----------------------');
  console.log('Your backup has finished:');
  console.log(`This operation took ${totalTime} minutes`);
  console.log(`Your backup is located in ${finalDestinationPath}`);
  console.log('----------------------');
}

// Uncomment to test the FTP Download without the cronjob.
//downloadFTPFiles();


module.exports = downloadFTPFiles;
