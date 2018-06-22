'use strict';

const deviceController = require('./devicecontroller');
const sdkOptions = require('./sdkoptions');
const log = require('./log');

module.exports = {
  execute,
};

function execute(args) {
  const command = args[0];
  const options = sdkOptions.load();

  switch (command) {
    case 'start':
      return deviceController.startDevices(options);
  }

  log.warn('Unknown command:', command);
  process.exit(1);
}