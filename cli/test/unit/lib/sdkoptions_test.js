'use strict';

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

const sdkOptions = require('../../../lib/sdkoptions');

const VALID_PACKAGE_JSON_MOCK = __dirname + '/../../fixtures';
const INVALID_PACKAGE_JSON_MOCK = '/fixtures/wrong';

describe('./lib/sdkoptions.js', function() {
  const sandbox = sinon.createSandbox();
  let envBackup;

  beforeEach(function() {
    envBackup = process.env;
    process.env = Object.assign({}, process.env);

    process.env.NEEO_SERVER_NAME = undefined;
    process.env.NEEO_SERVER_PORT = undefined;
    process.env.NEEO_HOST_IP = undefined;
    process.env.NEEO_HOST_PORT = undefined;
  }); 

  afterEach(function() {
    sandbox.restore();
    process.env = envBackup;
  });

  describe('load', function() {
    it('should return an empty object if package.json is not found', function() {
      sandbox.stub(process, 'cwd').returns(INVALID_PACKAGE_JSON_MOCK);

      const options = sdkOptions.load();
    
      expect(options).to.deep.equal({});
    });

    it('should return data from package.json if found', function() {
      sandbox.stub(process, 'cwd').returns(VALID_PACKAGE_JSON_MOCK);

      const options = sdkOptions.load();
    
      expect(options).to.deep.equal({
        serverName: 'unit-test-package-json',
        serverPort: 8888,
        brainHost: '10.0.0.42',
        brainPort: 8888,
      });
    });

    it('should use enviroment vars to override settings', function() {
      sandbox.stub(process, 'cwd').returns(VALID_PACKAGE_JSON_MOCK);
      process.env.NEEO_SERVER_NAME = 'unit-test-env';
      process.env.NEEO_SERVER_PORT = '4444';
      process.env.NEEO_HOST_IP = '10.0.0.24';
      process.env.NEEO_HOST_PORT = '3000';

      const options = sdkOptions.load();
    
      expect(options).to.deep.equal({
        serverName: 'unit-test-env',
        serverPort: '4444',
        brainHost: '10.0.0.24',
        brainPort: '3000',
      });
    });
  });
});
