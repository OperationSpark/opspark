/* global describe it expect before beforeEach afterEach */
require('mocha');
require('should');
require('cli-color');
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

const { dummySession, dummyTestPass, dummyTestFail, dummyGistGood } = require('./helpers/dummyData');

const project = dummySession.PROJECT[0];
const testPass = JSON.parse(dummyTestPass);
const testFail = JSON.parse(dummyTestFail);

const submit = proxyquire('../controller/submit', {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home,
  },
});

describe('submit', function () {

  describe('#checkGrade()', function () {
    it('should resolve if passing grade', function (done) {
      submit.checkGrade({ project, testResults: testPass })
        .then(function (resolve) {
          expect(resolve.project).to.eql(project);
          done();
        });
    });

    it('should reject if failing grade', function (done) {
      submit.checkGrade({ project, testResults: testFail })
        .catch(function (message) {
          expect(message).to.equal(`You have not passed all tests for ${project.name}! Must be have finished at least 50% to submit. Canceling submit.`.red);
          done();
        });
    });
  });

  describe('#createGist()', function () {
    it('should send project, gist, and tries after creating gist', function (done) {
      submit.createGist({ project, stats: testPass.stats })
        .then(function (resolve) {
          expect(resolve.project).to.eql(project);
          expect(resolve.gist).to.eql(JSON.parse(dummyGistGood));
          expect(resolve.tries).to.equal(1);
          done();
        });
    });
  });

  describe('#ensureGistExists()', function () {
    // it('should select session', function () {
    // });
  });

  describe('#deleteGist()', function () {
    it('should resolve if gist deleted', function (done) {
      submit.deleteGist('http://gist.github.com')
        .then(function (url) {
          expect(url).to.equal('http://gist.github.com');
          done();
        });
    });
  });
});
