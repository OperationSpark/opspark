/* global describe it expect before beforeEach afterEach */
require('mocha');

const fs = require('fs-extra');
const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const stdin = require('mock-stdin').stdin();

const config = require('../config');
const fakeHelpers = require('./helpers/fakeHelpers');

const janitor = proxyquire('../controller/janitor', {
  './env': {
    home: fakeHelpers.home,
  },
});

describe('janitor', function () {
  // TODO : Finish test //
  describe.skip('#fix()', function () {
    it('cleans all projects, writes missing project entries', function (done) {
      janitor.fix(function () {
        done();
      });
    });
  });

  describe('#error()', function () {
    it('should return a function', function () {
      const error1 = janitor.error('I\'m the error here');
      expect(error1).to.be.a.function;
      const error2 = janitor.error('I\'m another error');
      expect(error2).to.be.a.function;
    });

    it('should log input message', function () {
      const log = sinon.spy(console, 'error');
      expect(log.callCount).to.equal(0);
      expect(log.calledWith('I\'m the error here')).to.be.false;
      expect(log.calledWith('I\'m another error')).to.be.false;
      const error1 = janitor.error('I\'m the error here');
      expect(error1).to.throw();
      expect(log.callCount).to.equal(1);
      expect(log.calledWith('I\'m the error here')).to.be.true;
      const error2 = janitor.error('I\'m another error');
      expect(error2).to.throw();
      expect(log.calledWith('I\'m another error')).to.be.true;
      expect(log.callCount).to.equal(2);
      log.restore();
    });

    it('should throw error', function () {
      const error1 = janitor.error('I\'m the error here');
      expect(error1).to.throw();
      const error2 = janitor.error('I\'m another error');
      expect(error2).to.throw();
    });
  });
});
