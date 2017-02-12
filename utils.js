'use strict';
//Node Modules
const fs = require('fs');
const mkdirp = require('mkdirp');
const moment = require('moment');

//Methods we export
const utils = {
  ignoreBuilder,
  initFiles,
  makeFolder,
  writeLogging,
};

const logsPath = './Logs';
const dateFormatted = moment().format('YYYY-MM-D');
let logFileName = dateFormatted + '-log.txt';
let fullFilePath = logsPath + '/' + logFileName;
let fileHeaderMessage = dateFormatted + ' Backup Log File\r\n';

function ignoreBuilder(array){
  let formattedSearch = array.map((term)=>{
    return '(' + term + ')';
  })
  formattedSearch = formattedSearch.join('|');
  return formattedSearch;
};

function initFiles(callback){
  //Check to see if the file does not exist, if not then create it
  makeFolder(logsPath, ()=>{
    let fileNotExists = !fs.existsSync(fullFilePath);
    if(fileNotExists){
      fs.writeFile(fullFilePath, fileHeaderMessage, (err)=>{
        if(err) return console.log(err);
        if (callback) callback();
      });
    }else
      if (callback) callback();
  });
}

function makeFolder(folderPath, callback) {
  //Create a folder if none exists.
  fs.access(folderPath, fs.F_OK, (err) => {
    if (err) {
      mkdirp(folderPath, (err2) => {
        if (err2) console.log('There was an error:', err2);
        if(callback) callback();
      });
    }else
      if(callback) callback();
  });
}

function writeLogging(message, error){
  if(error) console.error(message);
  else console.log(message);

  //Add a new line for each write in the log file itself
  let timeFormatted = moment().format('HH:mm:ss');
  message = `[${timeFormatted}] ${message} \r\n`;
  fs.appendFile(fullFilePath, message, (err)=>{
    if(err) return console.log(err);
  });
}

module.exports = utils;