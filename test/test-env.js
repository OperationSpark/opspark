/* global describe it expect */

require('mocha');
require('sinon');
require('should');
const os = require('os');
const chai = require('./helpers/chai');
const env = require('../controller/env');

describe('env', function () {
  // afterEach(function () {
  //
  // });

  describe('#home()', function () {
    it('should return home dir of user, platform independent', function (done) {
      const home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
      expect(env.home()).to.equal(home);
      done();
    });
  });

  describe('#hostname()', function () {
    it('should return the hostname, platform independent', function (done) {
      const hostname = os.hostname();
      expect(env.hostname()).to.equal(hostname);
      done();
    });
  });
});
