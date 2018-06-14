'use strict';

/* eslint no-console: 0 */

module.exports = {
  info,
  warn,
  error,
};

function info(...args) {
  console.info('Info:', ...args);
}

function warn(...args) {
  console.warn('Warning:', ...args);
}

function error(...args) {
  console.error('Error:', ...args);  
}