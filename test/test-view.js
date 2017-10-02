var
  config = require('../config'),
  fs = require('fs-extra'),
  chai = require('./helpers/chai'),
  sinon = require('sinon'),
  mocha = require('mocha'),
  stdin = require('mock-stdin').stdin(),
  view = require('../view');

// TODO : figure out why these tests pass individually, but fail when running suite.
describe.skip('view', function () {
  afterEach(function () {
    stdin.restore();
  });

  after(function () {
    stdin.restore();
  });

  describe('#promptForInputCancelled()', function () {
    afterEach(function () {
      stdin.restore();
    });

    it('recursively allows user to re-enter input from stdin', function () {
      var promise = view.promptForInput('Give us some test input:').then(function (input) {
        console.log('Final input is ', input);
        expect(input).to.equal('jfraboni');
      });
      stdin.send("jbaloni\n", "ascii");
      stdin.send("n\n", "ascii");

      setTimeout(function () {
        stdin.send("jfraboni\n", "ascii");
        stdin.send("Y\n", "ascii");
      }, 100);
      return promise;
    });
  });

  describe('#promptForInput()', function () {
    afterEach(function () {
      stdin.restore();
    });

    this.timeout(15000);
    it('returns requested input from stdin', function () {
      var promise = view.promptForInput('Give us some test input:').then(function (input) {
        console.log('Input is', input);
        expect(input).to.equal('jfraboni');
      });
      stdin.send("jfraboni\n", "ascii");
      stdin.send("Y\n", "ascii");
      return promise;
    });
  });

  describe.skip('#inquireForInput()', function () {
    afterEach(function () {
      stdin.restore();
    });

    this.timeout(3000);
    var message = config.github.msg.enterUsername;
    it('NOTE: This test fails if run together with the other tests in this suite - there is some issue with the mock-sndin\nreturns requested input from stdin', function (done) {
      view.inquireForInput(message, function (err, username) {
        expect(err).to.be.null;
        expect(username).to.equal('jfraboni');
        done();
      });
      stdin.send("jfraboni\n", "ascii");
      stdin.send("Y\n", "ascii");
    });
  });

  describe.skip('#inquireForInputCancelled()', function () {
    afterEach(function () {
      stdin.restore();
    });

    this.timeout(3000);
    var message = config.github.msg.enterUsername;
    it('NOTE: This test fails if run together with the other tests in this suite - there is some issue with the mock-sndin\nrecursively allows user to re-enter input from stdin', function (done) {
      view.inquireForInput(message, function (err, username) {
        expect(err).to.be.null;
        expect(username).to.equal('jfraboni');
        done();
      });
      stdin.send("jbaloni\n", "ascii");
      stdin.send("n\n", "ascii");
      setTimeout(function () {
        stdin.send("jfraboni\n", "ascii");
        stdin.send("Y\n", "ascii");
      }, 100);
    });
  });
});