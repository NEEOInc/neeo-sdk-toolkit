'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('./lib/deviceloader.js', function() {
  const sandbox = sinon.createSandbox();
  let deviceLoader, filesystem;

  before(function() {
    mockery.enable({ warnOnReplace: true, warnOnUnregistered: false, useCleanCache: true });

    filesystem = require('../../../lib/filesystem');
    deviceLoader = require('../../../lib/deviceloader');    
  });

  after(function() {
    mockery.disable();
  });

  beforeEach(function() {
    sandbox.stub(process, 'cwd').returns('');
    sandbox.stub(filesystem, 'readDirectory').resolves([]);
    sandbox.stub(filesystem, 'readJSONFile').rejects(new Error('Unit Test: File not found'));
  }); 

  afterEach(function() {
    sandbox.restore();
    mockery.deregisterAll();
  });

  describe('loadDevices', function() {

    // TODO tests for neeo-sdk which matches format but doesn't have drivers
    // TODO test if there's an invalid main but legacy path

    context('neeo-driver modules using standard main & export', function() {
      const DRIVER_MODULE_NAMES = [
        'neeo-driver-a',
        'neeo_driver-b',
      ];

      beforeEach(function() {
        filesystem.readDirectory.resolves(DRIVER_MODULE_NAMES);

        DRIVER_MODULE_NAMES.forEach((mockDriver) => {
          filesystem.readJSONFile.withArgs(getPackageJSONPath(mockDriver))
            .resolves(getMockPackageJSON(mockDriver));

          mockery.registerMock(getMainScriptPath(mockDriver), {
            devices: [getMockDriver(mockDriver)],
          });
        });
      });

      it('should load the exposed drivers', function() {
        sandbox.stub(console, 'warn');

        return deviceLoader.loadDevices()
          .then((devices) => {
            expect(devices).to.deep.equal([
              getMockDriver('neeo-driver-a'),
              getMockDriver('neeo_driver-b'),
            ]);
            expect(console.warn).to.not.have.been.called;
          });
      });
    });

    context('legacy 0.50.x neeo modules with devices/index.js (no main ref)', function() {
      const LEGACY_DRIVER_MODULE_NAMES = [
        'neeo-driver-legacy-a',
        'neeo_driver-legacy-b',
      ];

      beforeEach(function() {
        filesystem.readDirectory.resolves(LEGACY_DRIVER_MODULE_NAMES);
        filesystem.readJSONFile.rejects(new Error('Unit Test: File not found'));

        LEGACY_DRIVER_MODULE_NAMES.forEach((mockDriver) => {
          mockery.registerMock(getLegacyIndexPath(mockDriver), {
            devices: [getMockDriver(mockDriver)],
          });
        });
      });

      it('should load legacy drivers', function() {
        return deviceLoader.loadDevices()
          .then((devices) => {  
            expect(devices).to.deep.equal([
              getMockDriver('neeo-driver-legacy-a'),
              getMockDriver('neeo_driver-legacy-b'),
            ]);
          });
      });

      it('should warn when loading drivers the legacy way', function() {
        sandbox.stub(console, 'warn');

        return deviceLoader.loadDevices()
        .then(() => {
          expect(console.warn).to.have.been.calledTwice;
        });
      });
    });

    context('when no devices are available', function() {
      it('should return an empty list', function() {
        return deviceLoader.loadDevices()
        .then((devices) => {
          expect(devices).to.deep.equal([]);
        });
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
        filesystem.readDirectory.resolves(NON_DRIVER_MODULE_NAMES);

        return deviceLoader.loadDevices()
          .then((devices) => {
            expect(devices).to.deep.equal([]);
          });
      });
    });
  });
});

function getMockDriver(name) {
  return { name };
}


function getPackageJSONPath(moduleName) {
  return `node_modules/${moduleName}/package.json`;
}

function getMockPackageJSON(moduleName) {
  return {
    main: `${moduleName}.js`,
  };
}

function getMainScriptPath(moduleName) {
  return `node_modules/${moduleName}/${moduleName}.js`;
}

function getLegacyIndexPath(moduleName) {
  return `node_modules/${moduleName}/devices/index.js`;
}
