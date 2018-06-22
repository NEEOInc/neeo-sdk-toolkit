'use strict';

const chalk = require('chalk');

/* eslint no-console: 0 */

module.exports = {
  info,
  warn,
  error,
};

function info(...args) {
  console.info(chalk.cyan.bold('Info:'), ...args);
}

function warn(...args) {
  console.warn(chalk.yellow.bold('Warning:'), ...args);
}

function error(...args) {
  console.error(chalk.red.bold('Error:'), ...args);  
}