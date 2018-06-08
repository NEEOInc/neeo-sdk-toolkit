'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const fs = require('fs');

describe('./lib/deviceloader.js', function() {
  const sandbox = sinon.createSandbox();
  let deviceLoader;

  before(function() {
    mockery.enable({ warnOnReplace: true, warnOnUnregistered: false, useCleanCache: true });
    mockery.registerAllowable('fs');

    deviceLoader = require('../../../lib/deviceloader');    
  });

  after(function() {
    mockery.disable();
  });

  beforeEach(function() {
    sandbox.stub(process, 'cwd').returns('');
    sandbox.stub(fs, 'readdirSync').returns([]);
  }); 

  afterEach(function() {
    sandbox.restore();
    mockery.deregisterAll();
  });

  describe('loadDevices', function() {
    context.skip('neeo-driver modules using standard main & export', function() {
      const DRIVER_MODULE_NAMES = [
        'neeo-driver-a',
        'neeo_driver-b',
      ];
      // TODO setup mockery to handle the requires...

      it('should return an empty list', function() {
        fs.readdirSync.returns(DRIVER_MODULE_NAMES);
        
        const devices = deviceLoader.loadDevices();

        expect(devices).to.deep.equal([
          { name: 'neeo-driver-a'},
          { name: 'neeo_driver-b'},
        ]);
      });
    });

    context('legacy 0.50.x neeo modules with devices/index.js (no main ref)', function() {
      const LEGACY_DRIVER_MODULE_NAMES = [
        'neeo-driver-legacy-a',
        'neeo_driver-legacy-b',
      ];

      beforeEach(function() {
        sandbox.stub(fs, 'existsSync');
        fs.readdirSync.returns(LEGACY_DRIVER_MODULE_NAMES);

        LEGACY_DRIVER_MODULE_NAMES.forEach((mockDriver) => {
          fs.existsSync.withArgs(getLegacyIndexPath(mockDriver)).returns(true);

          mockery.registerMock(getLegacyIndexPath(mockDriver), {
            devices: [{ name: mockDriver }],
          });
        });

      });

      it('should load legacy drivers', function() {
        const devices = deviceLoader.loadDevices();

        expect(devices).to.deep.equal([
          { name: 'neeo-driver-legacy-a'},
          { name: 'neeo_driver-legacy-b'},
        ]);
      });

      it('should warn when loading drivers the legacy way', function() {
        sandbox.stub(console, 'warn');
        deviceLoader.loadDevices();

        expect(console.warn).to.have.been.calledTwice;
      });
    });

    context('when no devices are available', function() {
      it('should return an empty list', function() {
        const devices = deviceLoader.loadDevices();

        expect(devices).to.deep.equal([]);
      });
    });

    context('non neeo driver modules', function() {
      const NON_DRIVER_MODULE_NAMES = [
        '@neeo',
        'lodash',
        'express',
        'helper-neeo-driver',
        'helper-neeo_driver',
        'driver',
        'neeo',
        'neeo-sdk',
      ];

      it('should return an empty list', function() {
        fs.readdirSync.returns(NON_DRIVER_MODULE_NAMES);

        const devices = deviceLoader.loadDevices();

        expect(devices).to.deep.equal([]);
      });
    });
  });
});

function getLegacyIndexPath(moduleName) {
  return `node_modules/${moduleName}/devices/index.js`;
}
