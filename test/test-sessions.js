/* global describe it expect before beforeEach afterEach */
require('mocha');
require('should');
require('colors');
const fs = require('fs');
const _ = require('lodash');
const util = require('util');
const sinon = require('sinon');
const prompt = require('prompt');
const rimraf = require('rimraf');
const process = require('process');
const fsJson = require('fs-json')();
const expect = require('chai').expect;
const bddStdin = require('bdd-stdin');
const proxyquire = require('proxyquire');
const changeCase = require('change-case');

const fakeHelpers = require('./helpers/fakeHelpers');

const { dummySession, dummySessions } = require('./helpers/dummyData');

const sessions = proxyquire('../controller/sessions', {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home,
  },
});

describe('sessions', function () {
  describe('#listSessions()', function () {
    it('should return array of session names', function () {
      const name1 = changeCase.titleCase(dummySessions[0].cohort);
      const name2 = changeCase.titleCase(dummySessions[1].cohort);
      const name3 = changeCase.titleCase(dummySessions[2].cohort);
      const result = [name1, name2, name3];
      const sessionsList = sessions.listSessions(dummySessions);
      expect(sessionsList).to.eql(result);
    });
  });

  describe('#pluckSession()', function () {
    it('should pluck desired session', function () {
      const name = changeCase.titleCase(dummySessions[0].cohort);
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[0]);
    });

    it('should pluck desired session', function () {
      const name = changeCase.titleCase(dummySessions[1].cohort);
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[1]);
    });

    it('should pluck desired session', function () {
      const name = changeCase.titleCase(dummySessions[2].cohort);
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[2]);
    });
  });

  describe('#selectSession()', function () {
    it('should select session', function (done) {
      bddStdin(bddStdin.keys.left, '\n', 'y\n');
      sessions.selectSession(JSON.stringify(dummySessions))
        .then(function (response) {
          console.log(response);
          expect(response).to.be.an.object;
          expect(response.session).to.eql(dummySessions[0]);
          done();
        });
    });

    it('should select correct session', function (done) {
      bddStdin(bddStdin.keys.left, bddStdin.keys.down, '\n', 'y\n');
      sessions.selectSession(JSON.stringify(dummySessions))
        .then(function (response) {
          expect(response).to.be.an.object;
          expect(response.session).to.eql(dummySessions[1]);
          done();
        });
    });
  });
});
