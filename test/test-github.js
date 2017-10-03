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

const { dummyAuth, dummyUser } = require('./helpers/dummyData');

const github = proxyquire('../controller/github', {
  './helpers': fakeHelpers,
  './env': {
    home: fakeHelpers.home,
  },
});

const applicationDirectory = './test/files/opspark';
const authFilePath = `${applicationDirectory}/auth`;
const userFilePath = `${applicationDirectory}/user`;


describe('github', function () {
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

  describe('#hasAuthorization()', function () {
    it('should return a promise', function () {
      expect(github.hasAuthorization()).to.be.an.instanceof(Promise);
    });

    it('should return a response object', function () {
      github.hasAuthorization()
        .then(function (res) {
          expect(res.statusCode).to.equal(200);
        });
    });
  });

  describe('#getOrObtainAuth()', function () {
    it('should return a promise', function () {
      expect(github.getOrObtainAuth()).to.be.an.instanceof(Promise);
    });

    it('should resolve auth object', function (done) {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
      github.getOrObtainAuth()
        .then(function (res) {
          expect(res).to.eql(dummyAuth);
          github.deleteUserInfo();
          done();
        });
    });
  });

  describe('#getOrCreateClient()', function () {
    it('should return a promise', function () {
      expect(github.getOrCreateClient()).to.be.an.instanceof(Promise);
    });

    it('should resolve user object', function (done) {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
      github.getOrCreateClient()
        .then(function (res) {
          expect(res).to.eql(dummyUser);
          github.deleteUserInfo();
          done();
        });
    });
  });

  describe('#obtainAndWriteAuth()', function () {
    it('should return a promise', function () {
      expect(github.obtainAndWriteAuth(dummyAuth)).to.be.an.instanceof(Promise);
    });

    it('should create auth file', function (done) {
      github.deleteAuth();
      expect(github.authExists()).to.be.false;
      github.obtainAndWriteAuth(dummyAuth)
        .then(function () {
          expect(github.authExists()).to.be.true;
          done();
        });
    });

    it('should send on auth data', function (done) {
      github.obtainAndWriteAuth(dummyAuth)
        .then(function (result) {
          expect(result).to.eql(dummyAuth);
          done();
        });
    });
  });

  describe('#obtainAndWriteUser()', function () {
    it('should return a promise', function () {
      expect(github.obtainAndWriteUser(dummyUser)).to.be.an.instanceof(Promise);
    });

    it('should create auth file', function (done) {
      github.deleteUser();
      expect(github.userExists()).to.be.false;
      github.obtainAndWriteUser(dummyUser)
        .then(function () {
          expect(github.userExists()).to.be.true;
          done();
        });
    });

    it('should send on auth data', function (done) {
      github.obtainAndWriteUser(dummyUser)
        .then(function (result) {
          expect(result).to.eql(dummyUser);
          done();
        });
    });
  });

  describe('#authorizeUser()', function () {
    github.deleteUserInfo();
    
    it('should return a promise', function () {
      expect(github.authorizeUser()).to.be.an.instanceof(Promise);
    });

    it('should provide creds', function (done) {
      bddStdin('livrush\nPassword\n');
      github.authorizeUser()
        .then(function (user) {
          expect(user.login).to.equal('livrush');
          expect(user.token).to.equal('fauxToken');
          done();
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

  describe('#deleteToken()', function () {
    beforeEach(function () {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
    });

    it('should return a promise', function () {
      expect(github.deleteToken(dummyAuth)).to.be.an.instanceof(Promise);
    });

    it('should return empty line if successful', function (done) {
      bddStdin('livrush\nPassword\n');
      github.deleteToken(dummyAuth)
        .then(function (res) {
          expect(res).to.equal('\n');
          done();
        });
    });
  });

  describe('#deauthorizeUser()', function () {
    beforeEach(function () {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
    });

    it('should return a promise', function () {
      expect(github.deauthorizeUser()).to.be.an.instanceof(Promise);
    });

    it('should return empty line if successful', function (done) {
      bddStdin('livrush\nPassword\n');
      github.deauthorizeUser()
        .then(function (res) {
          expect(res).to.equal(true);
          done();
        });
    });
  });
});
