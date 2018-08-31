'use strict';

const deviceController = require('./devicecontroller');
const sdkOptions = require('./sdkoptions');
const log = require('./log');

const COMMAND_START = 'start';

module.exports = {
  execute,
  COMMAND_START,
};

function execute(args) {
  const command = args[0];
  const options = sdkOptions.load();

  switch (command) {
    case COMMAND_START:
      return deviceController.startDevices(options);
  }

  log.warn('Unknown command:', command);
  process.exit(1);
}
