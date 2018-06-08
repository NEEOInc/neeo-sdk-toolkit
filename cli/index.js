#!/usr/bin/env node
'use strict';

const commands = require('./lib/commands');
const deviceController = require('./lib/devicecontroller');

const argv = require('yargs')
  .usage('Usage: neeo-sdk <command>')
  .command('start', 'start the SDK instance')
  .help('h')
  .alias('h', 'help').argv;

process.on('SIGINT', () => process.exit());
process.on('exit', () => deviceController.stopDevices());

commands.execute(argv._);
