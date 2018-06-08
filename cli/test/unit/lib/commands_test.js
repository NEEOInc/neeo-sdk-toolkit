'use strict';

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

const sdkOptions = require('../../../lib/sdkoptions');
const deviceController = require('../../../lib/devicecontroller');
const commands = require('../../../lib/commands');


describe('./lib/commands.js', function() {
  const sandbox = sinon.createSandbox();

  beforeEach(function() {
    sandbox.stub(process, 'exit');
    sandbox.stub(sdkOptions, 'load').returns({});
    sandbox.stub(deviceController, 'startDevices');
  }); 

  afterEach(function() {
    sandbox.restore();
  });

  describe('execute', function() {
    context('start command argument', function() {
      const START_ARGS = ['start'];

      it('should start devices with the current options', function() {
        const options = {};
        sdkOptions.load.returns(options);
  
        commands.execute(START_ARGS);
      
        expect(deviceController.startDevices).to.have.been.calledWith(options);
      });
    });

    context('unknown command argument', function() {
      it('should exit the process', function() {
        commands.execute(['invalid', 'command', 'arguments']);
      
        expect(process.exit).to.have.been.calledWith(1);
      });
    });
  });
});
