/* global describe it expect before beforeEach afterEach */
'doneuse strict';

require('mocha');
require('should');
require('colors');
const _ = require('lodash');
const util = require('util');
const fs = require('fs-extra');
const sinon = require('sinon');
const prompt = require('prompt');
const rimraf = require('rimraf');
const process = require('process');
const fsJson = require('fs-json')();
const chai = require('./helpers/chai');
const stdin = require('mock-stdin').stdin();

const config = require('../config');
const env = require('../controller/env');
const greenlight = require('../controller/greenlight');
const { dummyAuth, dummyUser, dummyProject, dummyGistGood, dummyGistBad } = require('./helpers/dummyData.js');

const applicationDirectory = `${env.home()}/opspark`;
const authFilePath = `${applicationDirectory}/auth`;
const userFilePath = `${applicationDirectory}/user`;

describe('greenlight', function () {
  describe('#getSessions()', function () {
    const getSessions = greenlight.getSessions;

    it('should return sessions for enrolled student', function (done) {
      getSessions({ id: dummyUser.id })
        .then((res) => {
          const sessions = JSON.parse(res);
          expect(sessions.status).to.not.exist;
          expect(sessions).to.be.an('object');
          done();
        });
    });

    it('should return error if not enrolled student', function (done) {
      getSessions({ id: dummyAuth.id })
        .then((res) => {
          const sessions = JSON.parse(res);
          expect(sessions.status).to.exist;
          expect(sessions.status).to.equal(400);
          done();
        });
    });
  });

  describe('#sendGrade()', function () {
    let log;
    const grade = greenlight.grade;

    beforeEach(function () {
      log = sinon.spy(console, 'log');
    });

    afterEach(function () {
      log.restore();
    });

    it('should receive good response', function (done) {
      sendGrade({ gist: dummyGistGood, project: dummyProject })
        .then(function () {
          expect(log.calledWith('Project attempt saved for Liv Rush'.blue)).to.be.true;
          done();
        });
    });

    it('should receive bad response', function (done) {
      sendGrade({ gist: dummyGistBad, project: dummyProject })
        .then(function () {
          expect(log.calledWith('Bad Request'.red)).to.be.true;
          done();
        });
    });

    it('should return gist url', function (done) {
      sendGrade({ gist: dummyGistGood, project: dummyProject })
        .then(function (res) {
          expect(res).to.equal(dummyGistGood.url);
          done();
        });
    });
  });

  describe('URI', function () {
    it('should reference greenlight.operationspark.org', function () {
      expect(greenlight.URI).to.equal('https://greenlight.operationspark.org');
    });
  });
});
