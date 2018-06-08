'use strict';

const debug = require('debug')('neeo:cli:DeviceLoader');
const fs = require('fs');
const path = require('path');

const LEGACY_EXPORT_PATH = 'devices';

module.exports = {
  loadDevices,
};

function loadDevices() {
  const npmDriversPath = getPathFromCwdTo('node_modules');

  return loadDevicesFrom({
    rootPath: npmDriversPath,
    filter: (file) => isNeeoDriver(npmDriversPath, file),
  });
}

function isNeeoDriver(driverPath, file) {
  const isNeeoPrefixed = (filename) =>
  filename.startsWith('neeo-') || filename.startsWith('neeo_');

  // TODO replace check for devices/index.js with the new package.json main option
  // keep the devices/index as a fallback with legacy warning.
  const devicesIndexPath = path.join(driverPath, file, LEGACY_EXPORT_PATH, 'index.js');

  return isNeeoPrefixed(file) && fs.existsSync(devicesIndexPath);
}

function getPathFromCwdTo(directory) {
  return path.join(process.cwd(), directory);
}

function loadDevicesFrom({ rootPath, filter }) {
  return fs
    .readdirSync(rootPath)
    .filter(filter)
    .map((file) => {
      try {
        debug('try to load driver from', rootPath, file);
        console.warn(`Warning: loading driver from legacy devices/index.js for ${file}.`);
        const devicesPath = path.join(rootPath, file, LEGACY_EXPORT_PATH, 'index.js');
        return require(devicesPath).devices;
      } catch (error) {
        console.error(
          `could not load devices in file ${file}: ${error.message}`
        );
      }
    })
    .reduce((acc, val) => acc.concat(val), [])
    .filter((device) => device);
}
