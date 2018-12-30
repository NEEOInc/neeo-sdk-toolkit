'use strict';

const BluePromise = require('bluebird');
const debug = require('debug')('neeo:cli:DeviceController');
const sdk = require('neeo-sdk');
const deviceLoader = require('./deviceloader');
const log = require('./log');

let serverConfiguration;

module.exports = {
  startDevices,
  stopDevices,
};

function stopDevices() {
  if (!serverConfiguration) {
    return;
  }
  sdk.stopServer(serverConfiguration)
    .catch((error) => {
      log.error(error.message);
      process.exit(1);
    });
}

function startDevices(sdkOptions) {
  return BluePromise.all([
      loadDevices(),
      getBrain(sdkOptions),
    ])
    .then((results) => {
      const [devices, brain] = results;
      log.info('Start server, connect to NEEO Brain:', {
        brain: brain.name || 'unknown',
        host: brain.host,
      });
      storeSdkServerConfiguration(brain, sdkOptions, devices);
      return sdk.startServer(serverConfiguration);
    })
    .then(() => {
      log.info('Your devices are now ready to use in the NEEO app!');
    })
    .catch((error) => {
      log.error(error.message);
      process.exit(1);
    });
}

function storeSdkServerConfiguration(brain, sdkOptions, devices) {
  const { serverPort, serverName, serverIp, serverBaseURL } = sdkOptions;
  serverConfiguration = {
    brain,
    port: serverPort || 6336,
    name: serverName || 'default',
    adapterIpAddress: serverIp,
    baseurl: serverBaseURL,
    devices,
  };
}

function loadDevices() {
  return deviceLoader.loadDevices()
    .then((devices) => {
      debug('Found devices:');
      devices.forEach((device) => {
        debug(' - ', device.manufacturer, device.devicename);
      });
      const noDevicesDefined = devices.length === 0;

      if (noDevicesDefined) {
        throw new Error(
          'No devices found! Make sure you expose devices in the "devices" directory ' +
          'or install external drivers through npm.'
        );
      }
      return devices;
    });
}

function getBrain(sdkOptions) {
  return isBrainDefinedIn(sdkOptions) ? getBrainFrom(sdkOptions) : findBrain();
}

function isBrainDefinedIn(sdkOptions) {
  const { brainHost } = sdkOptions;
  return (brainHost && brainHost !== '') || process.env.BRAINIP;
}

function getBrainFrom(sdkOptions) {
  const { brainHost, brainPort } = sdkOptions;
  return BluePromise.resolve({
    host: brainHost || process.env.BRAINIP,
    port: brainPort || 3000,
  });
}

function findBrain() {
  log.info('No Brain address configured, attempting to discover one...');
  return sdk.discoverOneBrain().then((brain) => {
    log.info('- Brain discovered:', brain.name);

    return brain;
  });
}
