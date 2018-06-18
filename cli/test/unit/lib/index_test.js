'use strict';

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

const sdkOptions = require('../../../lib/sdkoptions');
const deviceController = require('../../../lib/devicecontroller');
const commands = require('../../../lib/commands');
const index = require('../../../lib/index');


describe('./lib/index.js', function() {
  const sandbox = sinon.createSandbox();

  beforeEach(function() {
    sandbox.stub(commands, 'execute').resolves();
    sandbox.stub(sdkOptions, 'load');
    sandbox.stub(deviceController, 'stopDevices');
  }); 

  afterEach(function() {
    sandbox.restore();
  });

  describe('startServer', function() {
    it('should run command.execute with start', function() {
      return index.startServer()
        .then(() => {
          expect(commands.execute).to.have.been.calledWith(['start']);
        });
    });
  });

  describe('stopServer', function() {
    it('should call stopDevices', function() {
      index.stopServer();

      expect(deviceController.stopDevices).to.have.been.called;
    });
  });

  describe('loadNEEOSDKOptions', function() {
    it('should run command.execute with start', function() {
      const expectedOptions = {};
      sdkOptions.load.returns(expectedOptions);

      const options = index.loadNEEOSDKOptions();

      expect(options).to.equal(expectedOptions);
    });
  });
});
