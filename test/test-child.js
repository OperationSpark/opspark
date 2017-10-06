var
  config = require('../config'),
  fs = require('fs-extra'),
  chai = require('./helpers/chai'),
  sinon = require('sinon'),
  mocha = require('mocha'),
  child = require('../controller/child');

// TODO : figure out why these tests pass individually, but fail when running suite.
describe('child', function () {
  afterEach(function () {

  });

  after(function () {

  });

  describe('#execute()', function () {
    it('returns successfully after successfully executing a command', function () {
      return child.execute('ls').then(function (result) {
        console.log('Result is', result);
        expect(result.stdout).to.contain('package.json');
      });
    });

    it('returns unsuccessfully after unsuccessfully executing a command', function () {
      return child.execute('lssssss').catch(function (result) {
        console.log('Result is', result);
        expect(result.stderr).to.contain('lssssss: not found');
      });
    });
  });
});