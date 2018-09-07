#!/usr/bin/env node
'use strict';

const debug = require('debug')('neeo:cli:index');
const version = require('./package.json').version;
debug('START CLI v%s', version);

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
  debug('NO START PARAMETER FOUND, EXIT');
  cliParser.help();
  process.exit(1);
}

debug('EXECUTE COMMAND');
commands.execute([ commands.COMMAND_START ]);
