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


  describe('#runTests()', function () {
    const project = dummySessions[2].PROJECT[1];
    const name = changeCase.paramCase(project.name);
    const path = `${projectsDirectory}/${name}`;

    it.only('should run tests and get results', function (done) {
      projects.installProject(project)
      .then(() => {
        projects.ensureProjectsDirectory();
        test.grabTests(project).then(function () {
          console.log('Test grabbed!');
          expect(fs.existsSync(`${path}/test`)).to.be.true;
          test.runTests(project).then((results) => {
            console.log(results);
           const { passes, pending, failures } = results.testResults
            const tests = passes + pending + failures;
            expect(tests).to.be.greaterThan(0);
            test.displayResults(results)
            .then(() => {

              done();
            })
            .catch(error => console.log(error));
          })
          .catch(err => console.log(err));
        });
      })
    });
  });
});
