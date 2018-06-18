'use strict';

const BluePromise = require('bluebird');
const fs = require('fs');

const readdir = BluePromise.promisify(fs.readdir);
const readFile = BluePromise.promisify(fs.readFile);

module.exports = {
  readDirectory,
  readJSONFile,
  fileExists,
};

function readDirectory(directoryPath) {
  return readdir(directoryPath);
}

function readJSONFile(filePath) {
  return readFile(filePath, 'utf8')
    .then(JSON.parse);
}

function fileExists(filePath) {
  return new BluePromise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      return resolve();
    }
    reject(new Error(`${filePath} does not exist.`));
  });
}