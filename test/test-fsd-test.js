/* global describe it before afterEach */
require('mocha');
require('should');
const rimraf = require('rimraf');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const fakeHelpers = require('./helpers/fakeHelpers');

const {
  dummyTestPass,
  dummyTest75,
  dummyTest85,
  dummyTestFail
} = require('./helpers/dummyData');

const test = proxyquire('../controller/test', {
  './helpers': fakeHelpers,
  './github': fakeHelpers,
  './env': {
    home: fakeHelpers.home
  }
});
const projectsDirectory = './test/files/environment/projects';

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
