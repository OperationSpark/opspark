/* global describe it expect before beforeEach afterEach */
'doneuse strict';

require('mocha');
require('should');
require('colors');
const _ = require('lodash');
const util = require('util');
const fs = require('fs-extra');
const sinon = require('sinon');
const prompt = require('prompt');
const rimraf = require('rimraf');
const process = require('process');
const fsJson = require('fs-json')();
const bddStdin = require('bdd-stdin');
const chai = require('./helpers/chai');
const proxyquire = require('proxyquire');
const stdin = require('mock-stdin').stdin();

const { githubAuthToken } = require('./helpers/fakeHelpers');

githubAuthToken();

console.log(githubAuthToken);

// const helpers = proxyquire('../controller/helpers', fakeHelpers);

// console.log(JSON.stringify(fakeHelpers));

const config = require('../config');
const env = require('../controller/env');
const github = require('../controller/github');
const { dummyAuth, dummyUser } = require('./helpers/dummyData');

const applicationDirectory = `${env.home()}/opspark`;
const authFilePath = `${applicationDirectory}/auth`;
const userFilePath = `${applicationDirectory}/user`;


describe('github', function () {

  describe('#ensureApplicationDirectory()', function () {
    beforeEach(function (done) {
      rimraf(applicationDirectory, function () { done(); });
    });

    it('should create directory if none', function (done) {
      console.log('begin');
      expect(fs.existsSync(applicationDirectory)).to.be.false;
      github.ensureApplicationDirectory();
      expect(fs.existsSync(applicationDirectory)).to.be.true;
      done();
    });
  });

  describe('#writeAuth()', function () {
    beforeEach(function (done) {
      rimraf(applicationDirectory, function () { done(); });
    });

    it('should write auth file', function (done) {
      expect(fs.existsSync(authFilePath)).to.be.false;
      github.writeAuth(dummyAuth);
      expect(fs.existsSync(authFilePath)).to.be.true;
      done();
    });

    it('should write correct information', function (done) {
      github.writeAuth(dummyAuth);
      let auth = fs.readFileSync(authFilePath);
      auth = JSON.parse(auth);
      expect(auth).to.eql(dummyAuth);
      done();
    });
  });

  describe('#writeUser()', function () {
    beforeEach(function (done) {
      rimraf(applicationDirectory, function () { done(); });
    });

    it('should write user file', function (done) {
      expect(fs.existsSync(userFilePath)).to.be.false;
      github.writeUser(dummyUser);
      expect(fs.existsSync(userFilePath)).to.be.true;
      done();
    });

    it('should write correct information', function (done) {
      github.writeUser(dummyUser);
      let user = fs.readFileSync(userFilePath);
      user = JSON.parse(user);
      expect(user).to.eql(dummyUser);
      done();
    });
  });

  describe('#userInfoExists()', function () {
    beforeEach(function () {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
    });

    it('should return true if directory exists', function (done) {
      expect(github.userInfoExists()).to.be.true;
      done();
    });
  });

  describe('#deleteUserInfo()', function () {
    beforeEach(function () {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
    });

    it('should return true if directory exists', function (done) {
      expect(github.userInfoExists()).to.be.true;
      github.deleteUserInfo();
      expect(github.userInfoExists()).to.be.false;
      done();
    });
  });

  describe('#grabLocalUserID()', function () {
    it('should return user id if file exists', function (done) {
      github.writeUser(dummyUser);
      const placeholder = dummyUser.id;
      const result = github.grabLocalUserID();
      expect(result).to.equal(placeholder);
      done();
    });

    it('should throw error if file doesn\'t exist', function (done) {
      github.deleteUserInfo();
      expect(github.grabLocalUserID).to.throw(Error);
      expect(github.grabLocalUserID).to.throw(`There is no file at ${userFilePath}.`);
      done();
    });
  });

  describe('#grabLocalLogin()', function () {
    it('should return login if file exists', function (done) {
      github.writeUser(dummyUser);
      const placeholder = dummyUser.login;
      const result = github.grabLocalLogin();
      expect(result).to.equal(placeholder);
      done();
    });

    it('should throw error if file doesn\'t exist', function (done) {
      github.deleteUserInfo();
      expect(github.grabLocalLogin).to.throw(Error);
      expect(github.grabLocalLogin).to.throw(`There is no file at ${userFilePath}.`);
      done();
    });
  });

  describe('#grabLocalAuthID()', function () {
    it('should return id if file exists', function (done) {
      github.writeAuth(dummyAuth);
      const placeholder = dummyAuth.id;
      const result = github.grabLocalAuthID();
      expect(result).to.equal(placeholder);
      done();
    });

    it('should throw error if file doesn\'t exist', function (done) {
      github.deleteUserInfo();
      expect(github.grabLocalAuthID).to.throw(Error);
      expect(github.grabLocalAuthID).to.throw(`There is no file at ${authFilePath}.`);
      done();
    });
  });

  describe('#grabLocalAuthToken()', function () {
    it('should return token if file exists', function (done) {
      github.writeAuth(dummyAuth);
      const placeholder = dummyAuth.token;
      const result = github.grabLocalAuthToken();
      expect(result).to.equal(placeholder);
      done();
    });

    it('should throw error if file doesn\'t exist', function (done) {
      github.deleteUserInfo();
      expect(github.grabLocalAuthToken).to.throw(Error);
      expect(github.grabLocalAuthToken).to.throw(`There is no file at ${authFilePath}.`);
      done();
    });
  });


  describe('#promptForUserInfo()', function () {
    const promptForUserInfo = github.promptForUserInfo;

    it('should return a promise', function () {
      expect(promptForUserInfo()).to.be.an.instanceof(Promise);
    });

    it('should pipe out user inputs', function (done) {
      bddStdin('Username\nPassword\n');
      promptForUserInfo()
        .then(function (user) {
          expect(user.username).to.equal('Username');
          expect(user.password).to.equal('Password');
        });
      bddStdin('livrush\n********\n');
      promptForUserInfo()
        .then(function (user) {
          expect(user.username).to.equal('livrush');
          expect(user.password).to.equal('********');
          done();
        });
    });
  });

  describe('#obtainAndWriteAuth()', function () {
    const obtainAndWriteAuth = github.obtainAndWriteAuth;

    it('should return a promise', function () {
      expect(obtainAndWriteAuth(dummyAuth)).to.be.an.instanceof(Promise);
    });

    it('should pipe out user inputs', function (done) {
      obtainAndWriteAuth(dummyAuth)
        .then(function (result) {
          expect(result).to.eql(dummyAuth);
          done();
        });
    });
  });

  describe.skip('#authorizeUser()', function () {
    const authorizeUser = github.authorizeUser;

    it('should return a promise', function () {
      expect(authorizeUser()).to.be.an.instanceof(Promise);
    });

    it('should pipe out user inputs', function (done) {
      bddStdin('Username\nPassword\n');
      authorizeUser()
        .then(function (user) {
          expect(user.username).to.equal('Username');
          expect(user.password).to.equal('Password');
        });
      bddStdin('livrush\nAs if\n');
      authorizeUser()
        .then(function (user) {
          expect(user.username).to.equal('livrush');
          expect(user.password).to.equal('As if');
          done();
        });
    });
  });

  // describe.skip('#user()', function () {
  //   this.timeout(15000);
  //   it("returns valid github user", function (done) {
  //     github.user("jfraboni", function (err, user) {
  //       expect(user)
  //         .to.have.property("login")
  //         .and.to.equal("jfraboni");
  //       done();
  //     });
  //   });

  //   it("throws err if invalid github user", function (done) {
  //     github.user("*-^xyz", function (err, user) {
  //       expect(err).to.be.not.null;
  //       expect(user).to.be.undefined;
  //       done();
  //     });
  //   });
  // });

  // describe.skip('#repos()', function () {
  //   it('should obtain auth, then get all org repos', function (done) {
  //     github.repos(function (err, repos) {
  //       var names = _.map(repos, 'name');
  //       expect(names).to.include('circularity', 'frabonacci', 'line-crawler');
  //       done();
  //     });
  //   });
  // });

  // describe.skip('#limit()', function () {
  //   it('should return GitHub API rate-limit usage', function (done) {
  //     github.limit(function (err, msg) {
  //       console.log(msg);
  //       expect(msg).to.include('GitHub limit');
  //       done();
  //     });
  //   });
  // });

  // // deprecated: todo : remove //
  // describe.skip('#listAuth()', function () {
  //   this.timeout(15000);
  //   it('should list valid GitHub auths for the user', function (done) {
  //     github.listAuths('jfraboni', function (err, stdout, stderr) {
  //       if (err) console.log(err);
  //       done();
  //     });
  //   });
  // });

  // /*
  //  * Run manually : depends on creds.
  //  */
  // describe.skip('#authorize()', function () {
  //   this.timeout(30000);
  //   it('should authorize cli with github token', function (done) {
  //     var opsparkDir = github.getUserHome() + '/opspark';
  //     var filepath = opsparkDir + '/github';
  //     github.authorize('jfraboni', function () {
  //       assert(fs.existsSync(opsparkDir));
  //       assert(fs.existsSync(filepath));
  //       var auth = fsJson.loadSync(filepath);
  //       assert(_.has(auth, 'token'));
  //       done();
  //     });
  //   });
  // });

  // describe('#getNoteForHost()', function () {
  //   it('returns auth note unique to env', function (done) {
  //     var note = util.format(config.github.note, env.hostname());
  //     console.log(github.getNoteForHost());
  //     expect(github.getNoteForHost()).to.equal(note);
  //     done();
  //   });
  // });

  // /*
  //  * Run manually 
  //  */
  // describe.skip('#findToken()', function () {
  //   it('looks for token key', function (done) {
  //     var filepath = github.getUserHome() + '/opspark/github';
  //     if (fs.existsSync(filepath)) {
  //       var auth = fsJson.loadSync(filepath);
  //       assert(_.has(auth, 'token'));

  //       // var hasToken = (data.indexOf('token') > -1);
  //       // assert(hasToken);
  //       done();
  //     }
  //   });
  // });
});