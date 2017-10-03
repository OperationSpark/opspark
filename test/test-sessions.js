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

const { dummySession, dummySessions, dummyProjectsDirectory } = require('./helpers/dummyData');

const sessions = proxyquire('../controller/sessions', {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home,
  },
});

describe('projects', function () {
  describe('#listSessions()', function () {
    it('should return array of session names', function () {
      const name = changeCase.titleCase(dummySession.cohort);
      const result = [name, name, name];
      const sessionsList = sessions.listSessions(dummySessions);
      expect(sessionsList).to.eql(result);
    });
  });

  xdescribe('#selectProject()', function () {
    it('should select project', function (done) {
      bddStdin(bddStdin.keys.left, '\n', 'y\n');
      sessions.selectProject({ session: dummySession, projectAction: 'install' })
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
      sessions.selectProject({ session: dummySession, projectAction: 'install' })
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

  xdescribe('#pluckSessions()', function () {
    it('should install project', function (done) {
      sessions.installProject(dummySession.PROJECT[2])
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
      sessions.installProject(dummySession.PROJECT[3])
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
});
