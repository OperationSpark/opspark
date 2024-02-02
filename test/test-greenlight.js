/* global describe it before beforeEach afterEach after */
require('mocha');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const expect = require('chai').expect;

const fakeHelpers = require('./helpers/fakeHelpers.js');
const {
  dummyAuth,
  dummyUser,
  dummyProject,
  dummyGistGood,
  dummyGistBad,
  dummySessions
} = require('./helpers/dummyData.js');

describe('greenlight', function () {
  afterEach(function () {
    if (console.log.restore) console.log.restore();
  });

  describe('#getSessions()', function () {
    it('should return sessions for enrolled student', function (done) {
      const greenlight = proxyquire('../controller/greenlight', {
        './github': fakeHelpers,
        'request-promise': () =>
          new Promise((res, rej) => {
            res(dummySessions);
          })
      });
      greenlight.getSessions({ id: dummyUser.id }).then(res => {
        expect(res.status).to.not.exist;
        expect(res).to.be.an('array');
        done();
      });
    });

    it('should return error if not enrolled student', function (done) {
      const greenlight = proxyquire('../controller/greenlight', {
        './github': fakeHelpers,
        'request-promise': () =>
          new Promise((res, rej) => {
            res({ status: 400 });
          })
      });
      greenlight.getSessions({ id: dummyAuth.id }).then(res => {
        expect(res.status).to.exist;
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

  describe('#sendGrade()', function () {
    it('should receive good response', function (done) {
      const log = sinon.spy(console, 'log');
      const message = 'Project saved!';
      const greenlight = proxyquire('../controller/greenlight', {
        './github': fakeHelpers,
        'request-promise': () =>
          new Promise((res, rej) => {
            res({
              status: 200,
              message
            });
          })
      });
      greenlight
        .sendGrade({ gist: JSON.parse(dummyGistGood), project: dummyProject })
        .then(function () {
          expect(log.callCount).to.equal(1);
          expect(log.calledWith(message.blue)).to.be.true;
          done();
        });
    });

    it('should receive good response', function (done) {
      const log = sinon.spy(console, 'log');
      const message = 'Project saved for Liv!';
      const greenlight = proxyquire('../controller/greenlight', {
        './github': fakeHelpers,
        'request-promise': () =>
          new Promise((res, rej) => {
            res({
              status: 200,
              message
            });
          })
      });
      greenlight
        .sendGrade({ gist: JSON.parse(dummyGistGood), project: dummyProject })
        .then(function () {
          expect(log.callCount).to.equal(1);
          expect(log.calledWith(message.blue)).to.be.true;
          done();
        });
    });

    it('should receive bad response', function (done) {
      const log = sinon.spy(console, 'log');
      const reason = 'Bad credentials!';
      const details = 'This failed!';
      const greenlight = proxyquire('../controller/greenlight', {
        './github': fakeHelpers,
        'request-promise': () =>
          new Promise((res, rej) => {
            res({
              status: 400,
              reason,
              details
            });
          })
      });
      greenlight
        .sendGrade({ gist: dummyGistBad, project: dummyProject })
        .then(function () {
          expect(log.callCount).to.equal(2);
          expect(log.calledWith(reason.red)).to.be.true;
          expect(log.calledWith(details.red)).to.be.true;
          done();
        });
    });

    it('should return gist url', function (done) {
      const message = 'Project saved for Liv!';
      const greenlight = proxyquire('../controller/greenlight', {
        './github': fakeHelpers,
        'request-promise': () =>
          new Promise((res, rej) => {
            res({
              status: 200,
              message
            });
          })
      });
      greenlight
        .sendGrade({ gist: JSON.parse(dummyGistGood), project: dummyProject })
        .then(function (res) {
          expect(res).to.equal(JSON.parse(dummyGistGood).url);
          done();
        });
    });
  });
});
