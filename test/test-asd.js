// should test the following:
// 1. It should grab the test using 'grabTest()' from the selected project
// 2. It should run the test using 'runTest()' from the selected project
// 3. might have to create own pass /fail object structure for asd

/* global describe it expect before beforeEach afterEach */
require('mocha');
require('should');
const fs = require('fs');
const rimraf = require('rimraf');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const changeCase = require('change-case');

const fakeHelpers = require('./helpers/fakeHelpers');

const { dummySessionAsd } = require('./helpers/dummyData');

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
if (process.env.TEST_GITHUB_TOKEN) {
  // @ts-ignore (must be optional)
  delete testModuleMockRequires['./github-api'];
}

const test = proxyquire('../controller/test', testModuleMockRequires);

const projectsDirectory = './test/files/environment/projects';

describe('test', function () {
  before(function (done) {
    rimraf(projectsDirectory, done);
  });

  afterEach(function () {
    if (console.log.restore) console.log.restore();
  });

  // Should install tests for the selected project
  describe('#grabTests()', function () {
    dummySessionAsd.PROJECT.forEach(project => {
      it(`should install tests for ${project.name}`, function (done) {
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
    });
  });

  // Should run the tests for the selected project
  describe('#runTests()', function () {
    const project = dummySessionAsd.PROJECT[0];
    const passTests = proxyquire('../controller/test', {
      './helpers': {
        makeTestScript: fakeHelpers.makeTestPass
      },
      './github': fakeHelpers,
      './env': {
        home: fakeHelpers.home
      },
      './reporter': fakeHelpers.reportPass
    }).runTests;

    const failTests = proxyquire('../controller/test', {
      './helpers': {
        makeTestScript: fakeHelpers.makeTestFail
      },
      './github': fakeHelpers,
      './env': {
        home: fakeHelpers.home
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

    it('should return error if a project is not valid', function (done) {
      const invalidProject = {
        name: 'not-a-project',
        path: './test/files/environment/projects/not-a-project'
      };
      test.runTests(invalidProject).catch(function (err) {
        expect(err).to.exist;
        done();
      });
    });
  });
});
