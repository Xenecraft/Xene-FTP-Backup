const fs = require('fs');
const mkdirp = require('mkdirp');

const utils = {
	makeFolder: makeFolder,
};

function makeFolder(folderPath) {
  //Create a folder if none exists.
  fs.access(folderPath, fs.F_OK, (err) => {
    if (err) {
      mkdirp(folderPath, (err2) => {
        if (err2)
          console.log('There was an error:', err2);
      });
    }
  })
}


module.exports = utils;