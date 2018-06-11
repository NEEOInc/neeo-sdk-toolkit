'use strict';

const chai = require('chai');
const expect = chai.expect;
const deviceLoader = require('../../../lib/deviceloader');

describe('./lib/deviceloader.js', function() {
  describe('loadDevices', function() {
    context('when no devices are available', function() {
      it('should not throw', function() {
        expect(deviceLoader.loadDevices()).to.not.throw;
      });
    });
  });
});
