'use strict';

const sinon = require('sinon');
const chai = require('chai');
const path = require('path');
const expect = chai.expect;

const filesystem = require('../../../lib/filesystem');

const FIXTURES_PATH = '../../fixtures';

describe('./lib/filesystem.js', function() {
  const sandbox = sinon.createSandbox();

  beforeEach(function() {
  }); 

  afterEach(function() {
    sandbox.restore();
  });

  describe('readDirectory', function() {
    it('should return directory content', function() {
      const dirPath = pathTo(FIXTURES_PATH);
      const expectedResult = ['invalidJSON.txt', 'package.json'];

      return filesystem.readDirectory(dirPath)
        .then((files) => {
          expect(files).to.deep.equal(expectedResult);
        });
    });

    it('should reject if directory does not exist', function() {
      const dirPath = pathTo('nowhere');

      return filesystem.readDirectory(dirPath)
        .then(() => { throw new Error('should have failed'); })
        .catch((error) => {
          expect(error.message).to.contain('ENOENT');
        });
    });
  });

  describe('readJSONFile', function() {
    // 'invalidJSON.txt' FIXTURES_PATH
    it('should resolve parsed json', function() {
      const validJSONPath = pathTo(FIXTURES_PATH + '/package.json');
      return filesystem.readJSONFile(validJSONPath)
        .then((json) => {
          expect(json).to.deep.equal({
            'neeoSdkOptions': {
              'serverName': 'unit-test-package-json',
              'serverPort': 8888,
              'brainHost': '10.0.0.42',
              'brainPort': 8888,
            },
          });
        });
    });

    it('should reject non existant file', function() {
      const validJSONPath = pathTo(FIXTURES_PATH + '/does-not-exist.json');
      return filesystem.readJSONFile(validJSONPath)
        .then(() => { throw new Error('should have failed'); })
        .catch((error) => {
          expect(error.message).to.contain('ENOENT');
        });
    });

    it('should reject file with invalid json', function() {
      const validJSONPath = pathTo(FIXTURES_PATH + '/invalidJSON.txt');
      return filesystem.readJSONFile(validJSONPath)
        .then(() => { throw new Error('should have failed'); })
        .catch((error) => {
          expect(error.message).to.contain('Unexpected token');
        });
    });

  });

  describe('fileExists', function() {
    it('should resolve if file exists', function() {
      const existingPath = __filename;
      
      return filesystem.fileExists(existingPath);
    });

    it('should reject if file doesnt exist', function() {
      const nonExistentPath = pathTo('filesystem_test.js.fake-file');
      
      return filesystem.fileExists(nonExistentPath)
        .then(() => { throw new Error('should have failed'); })
        .catch((error) => {
          expect(error.message).to.equal(`${nonExistentPath} does not exist.`);
        });
    });
  });

  function pathTo(relativePathFromHere) {
    return path.join(__dirname, relativePathFromHere);
  }
});