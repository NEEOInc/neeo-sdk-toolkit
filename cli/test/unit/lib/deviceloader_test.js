'use strict';

const path = require('path');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

const NODE_MODULES_PATH = path.join(process.cwd(), 'node_modules');

describe('./lib/deviceloader.js', function() {
  const sandbox = sinon.createSandbox();
  let deviceLoader, filesystem, log;

  before(function() {
    mockery.enable({ warnOnReplace: true, warnOnUnregistered: false, useCleanCache: true });

    log = require('../../../lib/log');
    filesystem = require('../../../lib/filesystem');
    deviceLoader = require('../../../lib/deviceloader');    
  });

  after(function() {
    mockery.disable();
  });

  beforeEach(function() {
    sandbox.stub(filesystem, 'readDirectory').resolves([]);
    sandbox.stub(filesystem, 'readJSONFile').rejects(new Error('Unit Test: File not found'));
    sandbox.stub(filesystem, 'fileExists').rejects(new Error('Unit Test: File not found'));
  }); 

  afterEach(function() {
    sandbox.restore();
    mockery.deregisterAll();
  });

  describe('loadDevices', function() {
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
          filesystem.fileExists.withArgs(getMainScriptPath(mockDriver))
            .resolves();

          mockery.registerMock(getMainScriptPath(mockDriver), {
            devices: [getMockDriver(mockDriver)],
          });
        });
      });

      it('should load the exposed drivers', function() {
        sandbox.stub(log, 'warn');

        return deviceLoader.loadDevices()
          .then((devices) => {
            expect(devices).to.deep.equal([
              getMockDriver('neeo-driver-a'),
              getMockDriver('neeo_driver-b'),
            ]);
            expect(log.warn).to.not.have.been.called;
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

        LEGACY_DRIVER_MODULE_NAMES.forEach((mockDriver) => {
          filesystem.fileExists.withArgs(getLegacyIndexPath(mockDriver))
            .resolves();
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
        sandbox.stub(log, 'warn');

        return deviceLoader.loadDevices()
        .then(() => {
          expect(log.warn).to.have.been.calledTwice;
        });
      });

      it('should still load legacy device if main is set but wrong', function() {
        filesystem.readJSONFile.withArgs(getPackageJSONPath('neeo-driver-legacy-a'))
          .resolves(getMockPackageJSON('neeo-driver-legacy-a'));

        return deviceLoader.loadDevices()
          .then((devices) => {  
            expect(devices).to.deep.equal([
              getMockDriver('neeo-driver-legacy-a'),
              getMockDriver('neeo_driver-legacy-b'),
            ]);
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

      it('should not load the neeo-sdk as a driver', function() {
        filesystem.readDirectory.resolves(['neeo-sdk']);
        filesystem.readJSONFile.withArgs(getPackageJSONPath('neeo-sdk'))
          .resolves(getMockPackageJSON('neeo-sdk'));
        mockery.registerMock(getMainScriptPath('neeo-sdk'), {});

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
  return `${NODE_MODULES_PATH}/${moduleName}/package.json`;
}

function getMockPackageJSON(moduleName) {
  return {
    main: `${moduleName}.js`,
  };
}

function getMainScriptPath(moduleName) {
  return `${NODE_MODULES_PATH}/${moduleName}/${moduleName}.js`;
}

function getLegacyIndexPath(moduleName) {
  return `${NODE_MODULES_PATH}/${moduleName}/devices/index.js`;
}
