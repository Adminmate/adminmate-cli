const fs = require('fs');
const path = require('path');

const getAllFiles = function(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    }
    else {
      arrayOfFiles.push(path.join(__dirname.replace('adminmate-cli/', ''), dirPath, '/', file));
    }
  });

  return arrayOfFiles
};

module.exports.getAllFiles = getAllFiles;