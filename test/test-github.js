/* global describe it expect before beforeEach afterEach */
'use strict';

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
const expect = require('chai').expect;
const bddStdin = require('bdd-stdin');
const proxyquire = require('proxyquire');

const fakeHelpers = require('./helpers/fakeHelpers');

const helpers = proxyquire('../controller/github', { './helpers': fakeHelpers });

const config = require('../config');
const env = require('../controller/env');
const github = require('../controller/github');
const { dummyAuth, dummyUser } = require('./helpers/dummyData');

const applicationDirectory = `${env.home()}/opspark`;
const authFilePath = `${applicationDirectory}/auth`;
const userFilePath = `${applicationDirectory}/user`;


describe('github', function () {
  describe('#promptForUserInfo()', function () {
    it('should return a promise', function () {
      expect(github.promptForUserInfo()).to.be.an.instanceof(Promise);
    });
    it('should pipe out user inputs', function (done) {
      bddStdin('Username\nPassword\n');
      github.promptForUserInfo()
        .then(function (user) {
          expect(user.username).to.equal('Username');
          expect(user.password).to.equal('Password');
        });
      bddStdin('livrush\n********\n');
      github.promptForUserInfo()
        .then(function (user) {
          expect(user.username).to.equal('livrush');
          expect(user.password).to.equal('********');
          done();
        });
    });
  });

  describe('#ensureApplicationDirectory()', function () {
    beforeEach(function (done) {
      rimraf(applicationDirectory, function () { done(); });
    });
    it('should create directory if none', function (done) {
      expect(fs.existsSync(applicationDirectory)).to.be.false;
      github.ensureApplicationDirectory();
      expect(fs.existsSync(applicationDirectory)).to.be.true;
      done();
    });
  });

  describe('#authExists()', function () {
    it('should return true if directory exists', function (done) {
      expect(github.authExists()).to.be.false;
      fs.writeFileSync(authFilePath, dummyAuth);
      expect(github.authExists()).to.be.true;
      fs.unlinkSync(authFilePath);
      expect(github.authExists()).to.be.false;
      done();
    });
  });

  describe('#userExists()', function () {
    it('should return true if directory exists', function (done) {
      expect(github.userExists()).to.be.false;
      fs.writeFileSync(userFilePath, dummyAuth);
      expect(github.userExists()).to.be.true;
      fs.unlinkSync(userFilePath);
      expect(github.userExists()).to.be.false;
      done();
    });
  });

  describe('#userInfoExists()', function () {
    beforeEach(function () {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
    });
    afterEach(function (done) {
      rimraf(applicationDirectory, function () { done(); });
    });
    it('should return true if directory exists', function (done) {
      expect(github.userInfoExists()).to.be.true;
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

  describe('#getCredentials()', function () {
    it('should return a promise', function () {
      expect(github.getCredentials()).to.be.an.instanceof(Promise);
    });

    it('should resolve credentials when they exist', function (done) {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
      expect(github.userInfoExists()).to.be.true;
      github.getCredentials()
        .then(function (user) {
          expect(user.login).to.equal('livrush');
          expect(user.id).to.equal(23201987);
          expect(user.token).to.equal('fauxToken');
          fs.unlinkSync(authFilePath);
          fs.unlinkSync(userFilePath);
          done();
        });
    });

    // it('should call authorizeUser when no credentials exist', function (done) {
    //   expect(github.userInfoExists()).to.be.false;
    //   github.authorizeUser = sinon.stub(github, 'authorizeUser');
    //   bddStdin('username\npassword\n');
    //   github.getCredentials()
    //     .then(function (user) {
    //       expect(github.authorizeUser.callCount).to.equal(1);
    //       done();
    //     });
    // });
  });

  describe.skip('#hasAuthorization()', function () {
    it('should return a promise', function () {
      expect(1).to.equal(2);
    });
  });

  describe.skip('#getOrObtainAuth()', function () {
    it('should return a promise', function () {
      expect(github.getOrObtainAuth()).to.be.an.instanceof(Promise);
    });

    it('should resolve an object', function (done) {
      github.getOrObtainAuth()
        .then(function (res) {
          expect(res).to.be.an.object;
          done();
        });
    });
  });

  describe('#getOrCreateClient()', function () {
    it('should return a promise', function () {
      expect(github.getOrCreateClient()).to.be.an.instanceof(Promise);
    });

    it('should resolve an object', function (done) {
      github.getOrCreateClient()
        .then(function (res) {
          expect(res).to.be.an.object;
          done();
        });
    });
  });

  describe.skip('#obtainAndWriteAuth()', function () {
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

  describe.skip('#obtainAndWriteUser()', function () {
    it('should return a promise', function () {
      expect(1).to.equal(2);
    });
  });

  describe.skip('#authorizeUser()', function () {
    it('should return a promise', function () {
      expect(github.authorizeUser()).to.be.an.instanceof(Promise);
    });

    // TODO: update "getOrCreateClient" function
    it('should pipe out user inputs', function (done) {
      bddStdin('livrush\nPassword\n');
      github.authorizeUser()
        .then(function (user) {
          expect(user.username).to.equal('Username');
          expect(user.password).to.equal('Password');
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });

  describe('#deleteAuth()', function () {
    it('should delete auth file', function () {
      fs.createFileSync(authFilePath, dummyAuth);
      expect(fs.existsSync(authFilePath)).to.be.true;
      github.deleteAuth();
      expect(fs.existsSync(authFilePath)).to.be.false;
    });
  });

  describe('#deleteUser()', function () {
    it('should delete user file', function () {
      fs.createFileSync(userFilePath, dummyUser);
      expect(fs.existsSync(userFilePath)).to.be.true;
      github.deleteUser();
      expect(fs.existsSync(userFilePath)).to.be.false;
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

  describe.skip('#deleteToken()', function () {
    it('should return a promise', function () {
      expect(1).to.equal(2);
    });
  });

  describe.skip('#deauthorizeUser()', function () {
    it('should return a promise', function () {
      expect(1).to.equal(2);
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