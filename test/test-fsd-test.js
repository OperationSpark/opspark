/* global describe it expect before beforeEach afterEach */
const { home } = require('../controller/env');
const os = require('node:os');
const path = require('path');
require('mocha');
require('should');
const clc = require('cli-color');
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

const {
  dummySession,
  dummySessions,
  dummyTestPass,
  dummyTest75,
  dummyTest85,
  dummyTestFail,
} = require('./helpers/dummyData');
const { runTests } = require('../controller/test');

const projects = require('../controller/projects')

const test = proxyquire('../controller/test', {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home
  }
});
const projectsDirectory = './test/files/environment/projects';
const projectEntriesPath =
  './test/files/workenvironmentspace/projects/projects.json';

describe('test', function () {
  before(function (done) {
    rimraf(projectsDirectory, () => done());
  });

  afterEach(function () {
    if (console.log.restore) console.log.restore();
  });


  describe('#displayResults()', function () {
    it('should fail with failing results', function () {
      const { pass } = test.displayResults({
        testResults: JSON.parse(dummyTestFail)
      });
      expect(pass).to.be.false;
    });

    it('should show the right percent, 75%', function () {
      const { pass, grade } = test.displayResults({
        testResults: JSON.parse(dummyTest75)
      });
      expect(pass).to.be.false;
      expect(grade).to.equal(75);
    });

    it('should round up to the nearest whole number', function () {
      const { pass, grade } = test.displayResults({
        testResults: JSON.parse(dummyTest85)
      });
      expect(pass).to.be.false;
      expect(grade % 1).to.equal(0);
    });

    it('should pass with passing results', function () {
      const { pass } = test.displayResults({
        testResults: JSON.parse(dummyTestPass)
      });
      expect(pass).to.be.true;
    });
  });
});
