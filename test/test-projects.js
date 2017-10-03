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

const fakeHelpers = require('./helpers/fakeHelpers');
const { dummySession, dummyProjectsDirectory } = require('./helpers/dummyData');

const projects = proxyquire('../controller/projects', {
  './helpers': fakeHelpers,
  './env': {
    home: fakeHelpers.home,
  },
  fs: {
    readdirSync: () => dummyProjectsDirectory,
  },
});

const env = './test/files';
const projectsDirectory = `${env}/workspace/projects`;

describe('projects', function () {
  describe('#ensureProjectsDirectory()', function () {
    beforeEach(function () {
      if (fs.existsSync(projectsDirectory)) {
        rimraf(projectsDirectory, () => {});
      }
    });

    it('should create directory if it doesn\'t exist', function () {
      expect(fs.existsSync(projectsDirectory)).to.be.false;
      projects.ensureProjectsDirectory();
      expect(fs.existsSync(projectsDirectory)).to.be.true;
    });
  });

  describe('#listProjects()', function () {
    it('should list projects properly when installing', function () {
      const projectsList = projects.listProjects(dummySession, 'install');
      const result = [dummySession.PROJECT[3], dummySession.PROJECT[2]];
      expect(projectsList).to.eql(result);
    });

    it('should list projects properly when not installing', function () {
      const projectsList = projects.listProjects(dummySession, 'test');
      const result = [dummySession.PROJECT[1], dummySession.PROJECT[0]];
      expect(projectsList).to.eql(result);
    });
  });

  // describe('#installProject()', function () {
  //   it('should work', function () {
  //     projects.installProject(dummySession.PROJECT[0]);
  //   });
  // });
});
