var
  config = require('../config'),
  fs = require('fs-extra'),
  chai = require('./helpers/chai'),
  sinon = require('sinon'),
  mocha = require('mocha'),
  stdin = require('mock-stdin').stdin(),
  janitor = require('../controller/janitor');

describe('janitor', function () {
  // TODO : Finish test //
  describe.skip('#fix()', function () {
    this.timeout(15000);
    it('cleans all projects, writes missing project entries', function (done) {
      janitor.fix(function () {
        done();
      });
    });
  });

});