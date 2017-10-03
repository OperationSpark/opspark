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
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home,
  },
});

const projectsDirectory = './test/files/workspace/projects';
const projectEntriesPath = './test/files/workspace/projects/projects.json';

describe('projects', function () {
  describe('#ensureProjectsDirectory()', function () {
    before(function (done) {
      if (fs.existsSync(projectsDirectory)) {
        rimraf(projectsDirectory, () => done());
      } else {
        done();
      }
    });

    it('should create directory if it doesn\'t exist', function () {
      expect(fs.existsSync(projectsDirectory)).to.be.false;
      projects.ensureProjectsDirectory();
      expect(fs.existsSync(projectsDirectory)).to.be.true;
    });
  });

  describe('#ensureProjectDirectory()', function () {
    const path = `${projectsDirectory}/billypedia`;

    before(function (done) {
      if (fs.existsSync(path)) {
        rimraf(path, () => done());
      } else {
        done();
      }
    });

    it('should create directory if it doesn\'t exist', function () {
      expect(projects.ensureProjectDirectory(path)).to.be.false;
      fs.mkdirSync(path);
      expect(projects.ensureProjectDirectory(path)).to.be.true;
    });
  });

  describe('#listProjects()', function () {
    before(function () {
      fs.mkdirSync(`${projectsDirectory}/product-project`);
      fs.mkdirSync(`${projectsDirectory}/scratch-pad`);
      fs.mkdirSync(`${projectsDirectory}/underpants`);
    });

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

  describe('#selectProject()', function () {
    it('should select project', function (done) {
      bddStdin(bddStdin.keys.left, '\n', 'y\n');
      projects.selectProject({ session: dummySession, projectAction: 'install' })
        .then(function (project) {
          expect(project).to.be.an.object;
          expect(project.name).to.equal('Function Master');
          expect(project._id).to.exist;
          expect(project._session).to.exist;
          expect(project.desc).to.exist;
          expect(project.url).to.exist;
          done();
        });
    });

    it('should select correct project', function (done) {
      bddStdin(bddStdin.keys.left, bddStdin.keys.down, '\n', 'y\n');
      projects.selectProject({ session: dummySession, projectAction: 'install' })
        .then(function (project) {
          expect(project).to.be.an.object;
          expect(project.name).to.equal('Matchy');
          expect(project._id).to.exist;
          expect(project._session).to.exist;
          expect(project.desc).to.exist;
          expect(project.url).to.exist;
          done();
        });
    });
  });

  describe('#installProject()', function () {
    it('should install project', function (done) {
      projects.installProject(dummySession.PROJECT[2])
        .then(function (project) {
          expect(project).to.be.an.object;
          expect(project.name).to.equal('Matchy');
          expect(project._id).to.exist;
          expect(project._session).to.exist;
          expect(project.desc).to.exist;
          expect(project.url).to.exist;
          done();
        });
    });

    it('should install project', function (done) {
      projects.installProject(dummySession.PROJECT[3])
        .then(function (project) {
          expect(project).to.be.an.object;
          expect(project.name).to.equal('Function Master');
          expect(project._id).to.exist;
          expect(project._session).to.exist;
          expect(project.desc).to.exist;
          expect(project.url).to.exist;
          done();
        });
    });
  });

  describe('#appendProjectEntry()', function () {
    it('should create projects.json if it doesn\'t exist', function (done) {
      expect(fs.existsSync(projectEntriesPath)).to.be.false;
      projects.appendProjectEntry(dummySession.PROJECT[2], null, function () {
        expect(fs.existsSync(projectEntriesPath)).to.be.true;
        const projectsFile = JSON.parse(fs.readFileSync(projectEntriesPath));
        expect(projectsFile.projects.length).to.equal(1);
        done();
      });
    });

    it('should append project in projects.json', function (done) {
      projects.appendProjectEntry(dummySession.PROJECT[3], null, function () {
        const projectsFile = JSON.parse(fs.readFileSync(projectEntriesPath));
        expect(projectsFile.projects.length).to.equal(2);
        done();
      });
    });
  });

  describe('#initializeProject()', function () {
    it('should remove .git, .svn, .master, and test directories from project', function (done) {
      const path = `${projectsDirectory}/matchy`;
      expect(fs.existsSync(`${path}/.git`)).to.be.true;
      expect(fs.existsSync(`${path}/.svn`)).to.be.true;
      expect(fs.existsSync(`${path}/.master`)).to.be.true;
      expect(fs.existsSync(`${path}/test`)).to.be.true;
      projects.initializeProject(dummySession.PROJECT[2])
        .then(function (project) {
          expect(fs.existsSync(projectEntriesPath)).to.be.true;
          expect(fs.existsSync(`${path}/.git`)).to.be.false;
          expect(fs.existsSync(`${path}/.svn`)).to.be.false;
          expect(fs.existsSync(`${path}/.master`)).to.be.false;
          expect(fs.existsSync(`${path}/test`)).to.be.false;
          done();
        });
    });
    it('should remove .git, .svn, .master, and test directories from project', function (done) {
      const path = `${projectsDirectory}/function-master`;
      expect(fs.existsSync(`${path}/.git`)).to.be.true;
      expect(fs.existsSync(`${path}/.svn`)).to.be.true;
      expect(fs.existsSync(`${path}/.master`)).to.be.true;
      expect(fs.existsSync(`${path}/test`)).to.be.true;
      projects.initializeProject(dummySession.PROJECT[3])
        .then(function (project) {
          expect(fs.existsSync(projectEntriesPath)).to.be.true;
          expect(fs.existsSync(`${path}/.git`)).to.be.false;
          expect(fs.existsSync(`${path}/.svn`)).to.be.false;
          expect(fs.existsSync(`${path}/.master`)).to.be.false;
          expect(fs.existsSync(`${path}/test`)).to.be.false;
          done();
        });
    });
  });

  describe('#initializeProject()', function () {
    it('should uninstall project', function (done) {
      const path = `${projectsDirectory}/matchy`;
      expect(fs.existsSync(path)).to.be.true;
      bddStdin('y\n');
      projects.uninstallProject(dummySession.PROJECT[2])
        .then(function (project) {
          expect(fs.existsSync(path)).to.be.false;
          done();
        });
    });

    it('should uninstall project', function (done) {
      const path = `${projectsDirectory}/function-master`;
      expect(fs.existsSync(path)).to.be.true;
      bddStdin('y\n');
      projects.uninstallProject(dummySession.PROJECT[3])
        .then(function (project) {
          expect(fs.existsSync(path)).to.be.false;
          done();
        });
    });
  });
});
