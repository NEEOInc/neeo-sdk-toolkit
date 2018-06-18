'use strict';

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

const log = require('../../../lib/log');

/* eslint no-console: 0 */

describe('./lib/log.js', function() {
  const sandbox = sinon.createSandbox();

  beforeEach(function() {
    sandbox.stub(console, 'info');
    sandbox.stub(console, 'warn');
    sandbox.stub(console, 'error');
  }); 

  afterEach(function() {
    sandbox.restore();
  });

  describe('info', function() {
    it('should log info to console', function() {
      const logContent = ['some', 'arguments'];

      log.info(...logContent);

      expect(console.info).to.have.been.calledWith(sinon.match.string, ...logContent);
    });
  });

  describe('warn', function() {
    it('should log warn to console', function() {
      const logContent = ['some', 'arguments'];

      log.warn(...logContent);

      expect(console.warn).to.have.been.calledWith(sinon.match.string, ...logContent);
    });
  });

  describe('error', function() {
    it('should log error to console', function() {
      const logContent = ['some', 'arguments'];

      log.error(...logContent);

      expect(console.error).to.have.been.calledWith(sinon.match.string, ...logContent);
    });
  });
});