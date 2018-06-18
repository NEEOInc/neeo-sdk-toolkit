'use strict';

const debug = require('debug')('neeo:cli:DeviceLoader');
const BluePromise = require('bluebird');
const path = require('path');
const filesystem = require('./filesystem');
const log = require('./log');

const LEGACY_EXPORT_PATH = 'devices';
const MODULE_NEEO_PREFIXES = [
  // Recommended prefix:
  'neeo-driver-',
  // Legacy prefixes (not recommended):
  'neeo-',
  'neeo_',
];
const MODULE_BLACKLIST = [
  'neeo-sdk',
];
const NODE_MODULES_PATH = path.join(process.cwd(), 'node_modules');

module.exports = {
  loadDevices,
};

function loadDevices() {
  return getModulesList()
    .then(filterByNEEOPrefix)
    .then(getValidDriverPaths)
    .then(loadDrivers);
}

function getModulesList() {
  return filesystem.readDirectory(NODE_MODULES_PATH);
}

function filterByNEEOPrefix(moduleNames) {
  const matchesNEEODriver = (filename) => {
    const isNeeoPrefixed = MODULE_NEEO_PREFIXES.some((prefix) =>
      filename.startsWith(prefix)
    );
    const moduleIsNotBlacklisted = !MODULE_BLACKLIST.includes(filename);

    return isNeeoPrefixed && moduleIsNotBlacklisted;
  };

  return moduleNames.filter(matchesNEEODriver);
}

function getValidDriverPaths(moduleNames) {
  const pathPromises = moduleNames.map(getDriverPath);

  return BluePromise.all(pathPromises)
    .then((driverPaths) => driverPaths.filter((driverPath) => driverPath));
}

function getDriverPath(moduleName) {
  return getStandardPathIfFileExists(moduleName)
    .catch((error) => {
      debug('Driver for %s not available at standard path: %s', moduleName, error.message);
      return getLegacyPathIfFileExists(moduleName);
    })
    .catch((error) => {
      debug('Driver for %s not available at legacy path: %s', moduleName, error.message);
      log.error(
        `No device file found for ${moduleName}, ` +
        'that driver should specify its main file in its package.json'
      );
    });
}

function getStandardPathIfFileExists(moduleName) {
  const basePath = path.join(NODE_MODULES_PATH, moduleName);

  const packagePath = path.join(basePath, 'package.json');

  return filesystem.readJSONFile(packagePath)
    .then((packageContent) => {
      if (packageContent.main) {
        const driverPath = path.join(basePath, packageContent.main);
        return filesystem.fileExists(driverPath)
          .then(() => driverPath);
      }
      throw new Error('package.json missing main script');
    });
}

function getLegacyPathIfFileExists(moduleName) {
  const basePath = path.join(NODE_MODULES_PATH, moduleName);
  const legacyPath = path.join(basePath, LEGACY_EXPORT_PATH, 'index.js');

  return filesystem.fileExists(legacyPath)
    .then(() => {
      log.warn(`loading driver from legacy devices/index.js for ${moduleName}.`);
      debug('Using legacy path:', legacyPath);
      return legacyPath;
    });
}

function loadDrivers(driverPaths) {
  return driverPaths
    .filter((driverPath) => driverPath)
    .map((driverPath) => {
      try {
        debug('try to load driver from', driverPath);
        return require(driverPath).devices;
      } catch (error) {
        log.error(
          `could not load devices in file ${driverPath}: ${error.message}`
        );
      }
    })
    .reduce((acc, val) => acc.concat(val), [])
    .filter((device) => device);
}
