'use strict';
//Node Modules
const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');
const zlib = require('zlib');

//My Modules
const utils = require('./utils.js');
const settings = require('./settings.js');

let startTime = moment();
let startTimeString = startTime.format('HH[:]mm[:]ss');
let todayString = startTime.format('YYYY[.]MM[.]DD');
let destinationPath = settings.COPY_PATH.destinationPath;
let extractLogPath = destinationPath + todayString + path.sep + settings.COPY_PATH.folderName;
let baseLogLocation = `${extractLogPath}${path.sep}logs${path.sep}`;

function initLogCopy(){
	fs.readdir(baseLogLocation, (data, files)=>{
		files.map((file)=>{
			let localFile = `${baseLogLocation}${file}`;
			let newLocation = `${extractLogPath}${path.sep}ExtractedLogs${path.sep}`;

			if(localFile.endsWith('.gz')){
				console.log('Extracting', file, `to ${newLocation}`);
				gzExtract(localFile, newLocation, file);
			}
		})
	});
}

function gzExtract(filePath, newPath, fileName){
	let fileToBeExtracted = fs.createReadStream(filePath);
	let outputPath = newPath + fileName.slice(0, fileName.length-3);
	let output = fs.createWriteStream(outputPath);

	//Create a folder if none exists.
	utils.makeFolder(newPath);

	fileToBeExtracted.pipe(zlib.Unzip()).pipe(output);
}

module.exports = initLogCopy;