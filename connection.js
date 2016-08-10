'use strict';
//Node Modules
const Client = require('ftp');
const fs = require('fs');
const moment = require('moment');

//My Modules
const settings = require('./settings.js');
const utils = require('./utils.js');
const fileEndIgnore = new RegExp(/(.png)|(.jar)/g);

function startFTPDownload(callback) {
  //Instantiate all temporary variables for this routine
  let startTime = moment();
  let startTimeString = startTime.format('HH[:]mm[:]ss');
  let todayString = startTime.format('YYYY[.]MM[.]DD');
  let destinationPath = settings.COPY_PATH.destinationPath;
  let finalDestinationPath = destinationPath + todayString;

  console.log('----------------------');
  console.log(`Starting your backup! The time is currently ${startTimeString}.`);
  console.log(`Your files will go into ${finalDestinationPath}`);
  console.log('----------------------');
  //Create a folder if none exists.
  utils.makeFolder(finalDestinationPath);

  downloadFTPFiles(finalDestinationPath, startTime, callback);
}

function downloadFTPFiles(finalDestinationPath, startTime, callback) {
  //Main function where files are downloaded from. Will be called again if connection breaks.
  let c = new Client();
  let copyPath = settings.COPY_PATH.folderName;

  c.on('ready', () => {
    c.list(copyPath, (err, list) => {
      if (err) downloadRestart(err, finalDestinationPath, startTime);
      list.forEach((item) => {
        if (item.type == '-')
          downloadFile(c, copyPath, item.name, finalDestinationPath);
        else
          recursiveLookDown(c, copyPath + '/' + item.name, finalDestinationPath, startTime);
      });
      c.end();
    });
  });

  c.on('end', () => {
    finishFTPDownload(startTime, finalDestinationPath, callback);
  });

  c.connect(settings.CONNECTION_SETTINGS);
};

function finishFTPDownload(startTime, finalDestinationPath, callback) {
  let endTime = moment();
  let totalTime = endTime.diff(startTime, 'minutes');
  let endTimeString = endTime.format('HH[:]mm[:]ss');

  console.log('----------------------');
  console.log(`The connection has fully closed. The time is currently ${endTimeString}.`);
  console.log('Your backup has finished:');
  console.log(`This operation took ${totalTime} minutes`);
  console.log(`Your backup is located in ${finalDestinationPath}`);
  console.log('----------------------');

  if(callback)
    callback();
}

function downloadFile(c, filePath, fileName, finalDestinationPath, startTime) {
  let finalFile = filePath + '/' + fileName;
  utils.makeFolder(finalDestinationPath + '\\' + filePath)

  //Ignore downloading a file if it matches 
  if (!finalFile.match(fileEndIgnore)) {   
    c.get(finalFile, (err, stream) => {
      console.log('[Downloading]', finalFile);
      if (err) downloadRestart(err, finalDestinationPath, startTime);
      else {
        stream.once('close', () => { /*Each file closes its own connection*/ });
        stream.pipe(fs.createWriteStream(finalDestinationPath + '\\' + finalFile));
      }
    })
  } 
  else
    console.log('[Ignoring] ' + fileName + ' due to settings');
}

function recursiveLookDown(c, topDirectory, finalDestinationPath, startTime) {
  c.list(topDirectory, (err, list) => {
    if (err) {
      console.error('[Recrusive Error]', err);
      downloadRestart(err, finalDestinationPath, startTime);
    } else {
    list.forEach((item) => {
      if (item.type == '-')
        downloadFile(c, topDirectory, item.name, finalDestinationPath, startTime);
      else
        recursiveLookDown(c, topDirectory + '/' + item.name, finalDestinationPath, startTime);
    });
  }})
}

function downloadRestart(err, finalDestinationPath, startTime) {
  console.log('----------------------');
  console.error('[Download Error]', err);
  console.log(`We will restart the download process.`);
  console.log('----------------------');
  downloadFTPFiles(finalDestinationPath, startTime);
}

// Uncomment to test the FTP Download without the cronjob.
//downloadFTPFiles();

module.exports = startFTPDownload;
