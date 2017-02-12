'use strict';
//Node Modules
const Client = require('ftp');
const fs = require('fs');
const moment = require('moment');

//My Modules
const settings = require('./settings.js');
const utils = require('./utils.js');
const ignoreString = utils.ignoreBuilder(settings.COPY_PATH.ignoreFiles);
const fileEndIgnore = new RegExp(ignoreString, 'g');

function startFTPDownload(callback) {
  //Instantiate all temporary variables for this routine
  let startTime = moment();
  let startTimeString = startTime.format('HH[:]mm[:]ss');
  let todayString = startTime.format('YYYY[.]MM[.]DD');
  let destinationPath = settings.COPY_PATH.destinationPath;
  let finalDestinationPath = destinationPath + todayString;

  utils.initFiles(()=>{;
    utils.writeLogging('----------------------');
    utils.writeLogging(`Starting your backup! The time is currently ${startTimeString}.`);
    utils.writeLogging(`Your files will go into ${finalDestinationPath}`);
    utils.writeLogging('----------------------');
    
    utils.makeFolder(finalDestinationPath);
    downloadFTPFiles(finalDestinationPath, startTime, callback);
  });
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

  utils.writeLogging('----------------------');
  utils.writeLogging(`The connection has fully closed. The time is currently ${endTimeString}.`);
  utils.writeLogging('Your backup has finished:');
  utils.writeLogging(`This operation took ${totalTime} minutes`);
  utils.writeLogging(`Your backup is located in ${finalDestinationPath}`);
  utils.writeLogging('----------------------');

  if(callback)
    callback();
}

function downloadFile(c, filePath, fileName, finalDestinationPath, startTime) {
  let finalFile = filePath + '/' + fileName;
  utils.makeFolder(finalDestinationPath + '\\' + filePath)

  //Ignore downloading a file if it matches 
  if (!finalFile.match(fileEndIgnore)) {   
    c.get(finalFile, (err, stream) => {
      utils.writeLogging('[Downloading] ' + finalFile);
      if (err) downloadRestart(err, finalDestinationPath, startTime);
      else {
        stream.once('close', () => { /*Each file closes its own connection*/ });
        stream.pipe(fs.createWriteStream(finalDestinationPath + '\\' + finalFile));
      }
    })
  } 
  else
    utils.writeLogging('[Ignoring] ' + fileName + ' due to settings');
}

function recursiveLookDown(c, topDirectory, finalDestinationPath, startTime) {
  c.list(topDirectory, (err, list) => {
    if (err) {
      utils.writeLogging('[Recrusive Error]' + err, true);
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
  utils.writeLogging('----------------------');
  utils.writeLogging('[Download Error] ' + err, true);
  utils.writeLogging(`We will restart the download process.`);
  utils.writeLogging('----------------------');
  downloadFTPFiles(finalDestinationPath, startTime);
}

// Uncomment to test the FTP Download without the cronjob.
//downloadFTPFiles();

module.exports = startFTPDownload;
