/* global describe it expect before beforeEach afterEach */
require('mocha');
require('should');
const fs = require('fs');
const sinon = require('sinon');
const rimraf = require('rimraf');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const changeCase = require('change-case');

const fakeHelpers = require('./helpers/fakeHelpers');

const { TEST_GITHUB_TOKEN } = process.env;
const {
  dummySession,
  dummyTestPass,
  dummyTestFail
} = require('./helpers/dummyData');

const projects = proxyquire('../controller/projects', {
  './env': {
    home: fakeHelpers.home
  }
});

const testModuleMockRequires = {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './github-api': fakeHelpers,
  './env': {
    home: fakeHelpers.home
  }
};

// If TEST_GITHUB_TOKEN is set, use the real github-api,
// otherwise use mock the behavior with fakeHelpers
if (TEST_GITHUB_TOKEN) {
  // @ts-ignore (must be optional)
  delete testModuleMockRequires['./github-api'];
}

const test = proxyquire('../controller/test', testModuleMockRequires);

const projectsDirectory = './test/files/environment/projects';

describe('test', function () {
  before(function (done) {
    rimraf(projectsDirectory, () => done());
  });

  afterEach(function () {
    // @ts-ignore
    if (console.log.restore) console.log.restore();
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
      test.grabTests(project).then(function () {
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
      test.grabTests(project).then(function () {
        expect(fs.existsSync(`${path}/package.json`)).to.be.true;
        done();
      });
    });
  });

  describe('#runTests()', function () {
    const project = dummySession.PROJECT[1];
    const defaultMockRequires = {
      './github': fakeHelpers,
      './github-api': fakeHelpers,
      './env': {
        home: fakeHelpers.home
      }
    };

    if (TEST_GITHUB_TOKEN) {
      // @ts-ignore (must be optional)
      delete defaultMockRequires['./github-api'];
    }

    const passTests = proxyquire('../controller/test', {
      ...defaultMockRequires,
      './helpers': {
        makeTestScript: fakeHelpers.makeTestPass
      },
      './reporter': fakeHelpers.reportPass
    }).runTests;

    const failTests = proxyquire('../controller/test', {
      ...defaultMockRequires,
      './helpers': {
        makeTestScript: fakeHelpers.makeTestFail
      },
      './reporter': fakeHelpers.reportFail
    }).runTests;

    it('should run tests and find pass', function (done) {
      passTests(project).then(function (result) {
        const stats = result.testResults.stats;
        expect(result.project).to.exist;
        expect(result.testResults).to.exist;
        expect(stats.tests).to.equal(4);
        expect(stats.passes).to.equal(4);
        expect(stats.pending).to.equal(0);
        expect(stats.failures).to.equal(0);
        done();
      });
    });

    it('should run tests and find failure', function (done) {
      failTests(project).then(function (result) {
        const stats = result.testResults.stats;
        expect(result.project).to.exist;
        expect(result.testResults).to.exist;
        expect(stats.tests).to.equal(4);
        expect(stats.passes).to.equal(0);
        expect(stats.pending).to.equal(0);
        expect(stats.failures).to.equal(4);
        done();
      });
    });

    it('should log correct stats', function (done) {
      const log = sinon.spy(console, 'log');
      passTests(project).then(function (result) {
        const stats = result.testResults.stats;
        const { failures, passes, pending, tests } = stats;

        expect(
          log.calledWith(sinon.match(new RegExp(`Total tests:\\W+${tests}`))),
          "should include 'Total' test count"
        ).to.be.true;
        expect(
          log.calledWith(
            sinon.match(new RegExp(`Passing tests:\\W+${passes}`))
          ),
          'should include "Passing" test count'
        ).to.be.true;
        expect(
          log.calledWith(
            sinon.match(new RegExp(`Pending tests:\\W+${pending}`))
          ),
          'should include "Pending" test count'
        ).to.be.true;
        expect(
          log.calledWith(
            sinon.match(new RegExp(`Failing tests:\\W+${failures}`))
          ),
          'should include "Failing" test count'
        ).to.be.true;
        done();
      });
    });

    it('should log correct stats', function (done) {
      const log = sinon.spy(console, 'log');
      failTests(project).then(function (result) {
        const stats = result.testResults.stats;
        const { failures, passes, pending, tests } = stats;

        expect(
          log.calledWith(sinon.match(new RegExp(`Total tests:\\W+${tests}`))),
          "should include 'Total' test count"
        ).to.be.true;
        expect(
          log.calledWith(
            sinon.match(new RegExp(`Passing tests:\\W+${passes}`))
          ),
          'should include "Passing" test count'
        ).to.be.true;
        expect(
          log.calledWith(
            sinon.match(new RegExp(`Pending tests:\\W+${pending}`))
          ),
          'should include "Pending" test count'
        ).to.be.true;
        expect(
          log.calledWith(
            sinon.match(new RegExp(`Failing tests:\\W+${failures}`))
          ),
          'should include "Failing" test count'
        ).to.be.true;
        done();
      });
    });
  });

  describe('#displayResults()', function () {
    it('should fail with failing results', function () {
      const { pass } = test.displayResults({
        testResults: JSON.parse(dummyTestFail)
      });
      expect(pass).to.be.false;
    });

    it('should pass with passing results', function () {
      const { pass } = test.displayResults({
        testResults: JSON.parse(dummyTestPass)
      });
      expect(pass).to.be.true;
    });
  });
});
