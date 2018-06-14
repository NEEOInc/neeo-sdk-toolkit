'use strict';

const debug = require('debug')('neeo:cli:DeviceLoader');
const BluePromise = require('bluebird');
const path = require('path');
const filesystem = require('./filesystem');

const LEGACY_EXPORT_PATH = 'devices';
const MODULE_NEEO_PREFIXES = [
  'neeo-',
  'neeo_',
];
const MODULE_BLACKLIST = [
  'neeo-sdk',
];

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
  const npmDriversPath = getPathFromCwdTo('node_modules');

  return filesystem.readDirectory(npmDriversPath);
}

function getPathFromCwdTo(directory) {
  return path.join(process.cwd(), directory);
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
  const basePath = path.join(getPathFromCwdTo('node_modules'), moduleName);

  const packagePath = path.join(basePath, 'package.json');

  return filesystem.readJSONFile(packagePath)
    .then((packageContent) => {
      if (packageContent.main) {
        // TODO we should check if file exists as well
        return path.join(basePath, packageContent.main);
      }
      debug('main property missing from package.json');
      throw new Error('package.json missing main script');
    })
    .catch(() => {
      // TODO only warn if file exists
      console.warn(`Warning: loading driver from legacy devices/index.js for ${moduleName}.`);
      const legacyPath = path.join(basePath, LEGACY_EXPORT_PATH, 'index.js');
      debug('Using legacy path:', legacyPath);
      return legacyPath;
    });
}

function loadDrivers(driverPaths) {
  return driverPaths
    .map((driverPath) => {
      try {
        debug('try to load driver from', driverPath);
        return require(driverPath).devices;
      } catch (error) {
        console.error(
          `could not load devices in file ${driverPath}: ${error.message}`
        );
      }
    })
    .reduce((acc, val) => acc.concat(val), [])
    .filter((device) => device);
}
