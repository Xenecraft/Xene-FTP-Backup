'use strict';
const fs = require('fs-extra');
const path = require('path');
const zlib = require('zlib');
const mkdirp = require('mkdirp');

fs.readdir(__dirname, (data, files)=>{
	files.map((file)=>{
		let baseLocation = `${__dirname}${path.sep}`
		let localFile = `${baseLocation}${file}`
		let newLocation = `${baseLocation}Extract${path.sep}`;

		if(localFile.endsWith('.gz')){
			console.log('Extracting', file);
			gzExtract(localFile, newLocation, file);
		}
	})
});

function gzExtract(filePath, newPath, fileName){
	let fileToBeExtracted = fs.createReadStream(filePath);
	let outputPath = newPath + fileName.slice(0, fileName.length-3);

	//Create a folder if none exists.
	  fs.access(newPath, fs.F_OK, (err) => {
	    if (err) {
	      mkdirp(newPath, (err2) => {
	        if (err2)
	          console.log('There was an error:', err2);
	      });
	    }
	  })

  	let output = fs.createWriteStream(outputPath);
	fileToBeExtracted.pipe(zlib.Unzip()).pipe(output);
}