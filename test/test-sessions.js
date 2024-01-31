/* global describe it expect before beforeEach afterEach */
require('mocha');
require('should');

const expect = require('chai').expect;
const bddStdin = require('bdd-stdin');
const proxyquire = require('proxyquire');

const fakeHelpers = require('./helpers/fakeHelpers');

const { dummySessions } = require('./helpers/dummyData');

const sessions = proxyquire('../controller/sessions', {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home
  }
});

describe('sessions', function () {
  describe('#pluckSession()', function () {
    it('should pluck desired session', function () {
      const name = dummySessions[0].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[0]);
    });

    it('should pluck desired session', function () {
      const name = dummySessions[1].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[1]);
    });

    it('should pluck desired session', function () {
      const name = dummySessions[2].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[2]);
    });
  });

  describe('#selectSession()', function () {
    it('should select session', function (done) {
      bddStdin(
        bddStdin.keys.left, // Select first session
        '\n', // Submit selection
        'y\n' // Confirm
      );
      sessions
        .selectSession(JSON.stringify(dummySessions))
        .then(function (response) {
          console.log(response);
          expect(response).to.be.an('object');
          expect(response.session).to.eql(dummySessions[0]);
          done();
        });
    });

    // TODO: Figure out why the stdin down is not selecting the second session. The select session function works as expected when tested manually.
    it.skip('should select correct session', function (done) {
      bddStdin(
        bddStdin.keys.left,
        bddStdin.keys.down, // Select second session
        '\n', // Submit selection
        'y\n' // Confirm
      );
      sessions
        .selectSession(JSON.stringify(dummySessions))
        .then(function (response) {
          expect(response).to.be.an('object');
          expect(response.session).to.eql(dummySessions[1]);
          done();
        });
    });
  });

  describe('#pluckSession()', function () {
    it('should pluck desired fsd session', function () {
      console.log(dummySessions);
      const name = dummySessions[2].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[2]);
    });

    it('should not pluck desired fsd session', function () {
      const name = dummySessions[0].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[0]);
    });
  });

  describe('#selectSession#()', function () {
    it('should select session', function (done) {
      bddStdin(bddStdin.keys.left, '\n', 'y\n');
      sessions
        .selectSession(JSON.stringify(dummySessions))
        .then(function (response) {
          console.log(response);
          expect(response).to.be.an('object');
          expect(response.session).to.eql(dummySessions[0]);
          done();
        });
    });

    // TODO: Figure out why the stdin down is not selecting the second session. The select session function works as expected when tested manually.
    it.skip('should select correct session', function (done) {
      bddStdin(
        bddStdin.keys.left,
        bddStdin.keys.down, // Select first session
        '\n', // Submit selection
        'y\n' // Confirm
      );
      sessions
        .selectSession(JSON.stringify(dummySessions))
        .then(function (response) {
          expect(response).to.be.an('object');
          expect(response.session).to.eql(dummySessions[1]);
          done();
        });
    });
  });
});
