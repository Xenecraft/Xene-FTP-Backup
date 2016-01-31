'use strict';
var Client = require('ftp');
var mkdirp = require('mkdirp');
var fs = require('fs');
var moment = require('moment');
var settings = require('./settings.js');

var today = moment().format('YYYY[.]MM[.]DD');
var destinationPath = settings.COPY_PATH.destinationPath;
var copyPath = settings.COPY_PATH.folderName;
var finalDestinationPath = destinationPath + today;

var c = new Client();

console.log('----------------------');
console.log('Starting your backup!');
console.log('----------------------');
makeFolder(finalDestinationPath);

c.on('ready', function() {
  c.list(copyPath, (err, list) => {
    if (err) throw err;
    list.forEach((item) => {
      if (item.type == '-')
        downloadFile(copyPath, item.name)
      else
        recursiveLookDown(copyPath + '/' + item.name)
    })
    c.end();
  });

});

c.connect(settings.CONNECTION_SETTINGS);

function downloadFile(filePath, fileName) {
  let finalFile = filePath + '/' + fileName;
  makeFolder(finalDestinationPath + '\\' + filePath)
  c.get(finalFile, (err, stream) => {
    console.log('dling', finalFile);
    if (err) throw err;
    stream.once('close', function() {
      c.end();
    });
    stream.pipe(fs.createWriteStream(finalDestinationPath + '\\' + finalFile));
  })
}

function makeFolder(folderPath) {
  fs.access(folderPath, fs.F_OK, (err) => {
    mkdirp(folderPath, (err) => {
      if (err)
        console.log('Folder created');
      // else console.log(finalDestinationPath, 'created');
    });
  })
}

function recursiveLookDown(topDirectory) {
  c.list(topDirectory, (err, list) => {
    if (err) throw err
    list.forEach((item) => {
      if (item.type == '-')
        downloadFile(topDirectory, item.name);
      else
        recursiveLookDown(topDirectory + '/' + item.name);
    });
  })
}
