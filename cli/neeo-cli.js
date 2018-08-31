#!/usr/bin/env node
'use strict';

const cliParser = require('commander');
const commands = require('./lib/commands');
const deviceController = require('./lib/devicecontroller');

process.on('SIGINT', () => process.exit());
process.on('exit', () => deviceController.stopDevices());

cliParser
  .usage('<command>')
  .option('-s, start', 'Start the SDK instance')
  .parse(process.argv);

if (!cliParser.start) {
  cliParser.help();
  process.exit(1);
}

commands.execute(commands.COMMAND_START);
