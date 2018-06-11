'use strict';

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

const sdk = require('neeo-sdk');
const deviceLoader = require('../../../lib/deviceloader');
const { startDevices, stopDevices } = require('../../../lib/devicecontroller');

describe('./lib/devicecontroller.js', function() {
  const sandbox = sinon.sandbox.create();

  beforeEach(function() {
    sandbox.stub(sdk, 'discoverOneBrain').resolves();
    sandbox.stub(sdk, 'stopServer').resolves();
    sandbox.stub(sdk, 'startServer').resolves();
  }); 

  afterEach(function() {
    sandbox.restore();
  });

  describe('stopDevices', function() {
    context('when no server configuration has been stored', function() {
      it('should not stop the server', function() {
        stopDevices();

        expect(sdk.stopServer).to.not.have.been.called;
      });
    });

    context('when the server configuration has been stored', function() {
      it('should stop the server', function() {
        sandbox
          .stub(deviceLoader, 'loadDevices')
          .returns([buildSampleDevice()]);

        return startDevices({ brainHost: '10.0.0.1' }).then(() => {
          stopDevices();
          expect(sdk.stopServer).to.have.been.called;
        });
      });
    });
  });

  describe('startDevices', function() {
    context('when no devices are found', function() {
      it('should exit process', function() {
        const sdkOptions = {
          brainHost: '10.0.0.1',
        };
        sandbox.stub(deviceLoader, 'loadDevices').returns([]);
        sandbox.stub(process, 'exit').returns();

        return startDevices(sdkOptions)
          .then(() => {
            expect(process.exit).to.have.been.calledOnce;
          });
      });
    });

    context('when brain host is configured', function() {
      it('should start the server on given brain host', function() {
        const sdkOptions = {
          brainHost: '10.0.0.1',
        };

        const device = buildSampleDevice();
        sandbox.stub(deviceLoader, 'loadDevices').returns([device]);

        return startDevices(sdkOptions).then(() => {
          expect(sdk.startServer).to.have.been.calledWith({
            brain: {
              host: '10.0.0.1',
              port: 3000,
            },
            port: 6336,
            name: 'default',
            devices: [device],
          });
        });
      });
      context('when brain host is not configured', function() {
        it('should start the server against the first discovered brain', function() {
          sdk.discoverOneBrain.resolves({ host: '10.0.0.2', port: 3001 });

          const device = buildSampleDevice();
          sandbox.stub(deviceLoader, 'loadDevices').returns([device]);

          return startDevices({}).then(() => {
            expect(sdk.startServer).to.have.been.calledWith({
              brain: {
                host: '10.0.0.2',
                port: 3001,
              },
              port: 6336,
              name: 'default',
              devices: [device],
            });
          });
        });
      });
    });
  });

  function buildSampleDevice() {
    return sdk.buildDevice('example-adapter')
      .addButton({ name: 'example-button', label: 'my button' })
      .addButtonHandler(function() {})
      .build('foo');
  }
});
