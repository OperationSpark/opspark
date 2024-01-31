/* global describe it expect before beforeEach afterEach */
require('mocha');
require('should');
const fs = require('fs');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const rimraf = require('rimraf');

const fakeHelpers = require('./helpers/fakeHelpers');

const { dummySession } = require('./helpers/dummyData');

const projects = proxyquire('../controller/projects', {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home
  }
});

const projectsDirectory = './test/files/environment/projects';

describe('#installProject()', function () {
  before(function (done) {
    if (fs.existsSync(projectsDirectory)) {
      rimraf(projectsDirectory, () => done());
    } else {
      done();
    }
  });

  dummySession.PROJECT.forEach(project => {
    it(`should install project for ${project.name}`, function (done) {
      projects.installProject(project).then(function (results) {
        expect(results).to.be.an('object');
        expect(results.name).to.exist;
        expect(results._id).to.exist;
        expect(results.desc).to.exist;
        expect(results.url).to.exist;
        done();
      });
    });
  });
});
