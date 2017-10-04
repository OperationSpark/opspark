/* global describe it expect before beforeEach afterEach */
'use strict';

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

const projects = proxyquire('../controller/projects', {
  './env': {
    home: fakeHelpers.home,
  },
});

const test = proxyquire('../controller/test', {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home,
  },
});

const projectsDirectory = './test/files/workspace/projects';
const projectEntriesPath = './test/files/workspace/projects/projects.json';

describe('test', function () {
  before(function (done) {
    rimraf(projectsDirectory, () => done());
  });

  describe('#grabTests()', function () {
    it('should install tests', function (done) {
      const project = dummySession.PROJECT[0];
      const name = changeCase.paramCase(project.name);
      const path = `${projectsDirectory}/${name}`;
      expect(fs.existsSync(`${path}/test`)).to.be.false;
      projects.ensureProjectsDirectory();
      fs.mkdirSync(path);
      fs.writeFileSync(`${path}/package.json`, '{}');
      test.grabTests(project)
        .then(function () {
          expect(fs.existsSync(`${path}/test`)).to.be.true;
          done();
        });
    });

    it('should install package.json if necessary', function (done) {
      const project = dummySession.PROJECT[1];
      const name = changeCase.paramCase(project.name);
      const path = `${projectsDirectory}/${name}`;
      expect(fs.existsSync(`${path}/package.json`)).to.be.false;
      projects.ensureProjectsDirectory();
      fs.mkdirSync(path);
      test.grabTests(project)
        .then(function () {
          expect(fs.existsSync(`${path}/package.json`)).to.be.true;
          done();
        });
    });
  });

  describe.skip('#runTests()', function () {
    it('should run tests', function () {

    });

    it('should select correct session', function () {

    });
  });

  describe.skip('#displayResults()', function () {
    it('should display results as specified', function () {
      
    });
  });
});
