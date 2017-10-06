var
  config = require('../config'),
  fs = require('fs-extra'),
  chai = require('./helpers/chai'),
  sinon = require('sinon'),
  mocha = require('mocha'),
  mockery = require('mockery');

var list = [
  {
    id: 29655824,
    name: 'line-crawler'
  },
  {
    id: 29925564,
    name: 'circularity'
  },
  {
    id: 30997229,
    name: 'worm-hole'
  }
];

// TODO : FIX This test relies on promptForInput, which isn't mocking properly for tests within suites, whereas they pass individually.
describe.skip('pair', function () {
  describe('#up()', function () {
    afterEach(function () {
      mockery.disable();
      mockery.deregisterAll();
    })

    /*
     * Functional: This test merely seals the order of execution for the
     * process as all sub-processes are unit-tested.
     */
    it('verifies the order of execution: promptForInput of partner github username, github user to verify user, projects.list, projects.selectProject, projects.installProject', function (done) {
      this.timeout(15000);

      var complete = sinon.spy();

      var username = 'jfraboni';
      var user = {
        login: 'jfraboni'
      };
      var project = {
        name: 'someProject'
      };

      mockery.registerAllowable(pair);

      var mockView = {
        promptForInput: function (message, callback) {
          callback(null, username);
        }
      };
      mockery.registerMock('../view', mockView);

      var mockGithub = {
        user: function (username, callback) {
          callback(null, user);
        }
      };
      mockery.registerMock('./github', mockGithub);

      var mockProjects = {
        list: function (callback) {
          callback(null, list);
        },
        selectProject: function (list, callback) {
          callback(null, project);
        },
        installProject: function (project, username, callback) {
          complete();
          callback();
        }
      };
      mockery.registerMock('./projects', mockProjects);

      mockery.enable({
        useCleanCache: true
      });

      var pair = require('../controller/pair');
      pair.up(function () {
        assert(complete.called);
        done();
      });
    });
  });

});