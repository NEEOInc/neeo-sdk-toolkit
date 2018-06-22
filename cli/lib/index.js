'use strict';

const commands = require('./commands');
const deviceController = require('./devicecontroller');
const sdkOptions = require('./sdkoptions');

module.exports = {
  startServer,
  stopServer,
  loadNEEOSDKOptions,
};

/**
 * Starts the server like the cli from the CWD.
 * It will exit the process if the server fails to start.
 * @returns {Promise} resolved when server is started.
 */
function startServer() {
  return commands.execute(['start']);
}

/**
 * Stops the server if currently running and exits the process.
 */
function stopServer() {
  return deviceController.stopDevices();
}

/**
 * Returns the neeoSdkOptions object built
 * from the package.json in the cwd and the env variables.
 * @returns {Object} neeoSdkOptions
 */
function loadNEEOSDKOptions() {
  return sdkOptions.load();
}
