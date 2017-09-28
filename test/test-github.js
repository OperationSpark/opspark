/* global describe it expect before beforeEach afterEach */
'use strict';

require('mocha');
require('should');
require('colors');
const _ = require('lodash');
const util = require('util');
const fs = require('fs-extra');
const sinon = require('sinon');
const rimraf = require('rimraf');
const fsJson = require('fs-json')();
const chai = require('./helpers/chai');
const stdin = require('mock-stdin').stdin();

const config = require('../config');
const env = require('../controller/env');
const github = require('../controller/github');

const applicationDirectory = `${env.home()}/opspark`;
const authFilePath = `${applicationDirectory}/auth`;
const userFilePath = `${applicationDirectory}/user`;

const dummyAuth = {
  id: 131736381,
  url: 'https://api.github.com/authorizations/131736381',
  app: {
    name: 'opspark for macs-MacBook.local: cli util to install, setup, and grade student projects',
    url: 'https://www.npmjs.com/package/opspark',
    client_id: '00000000000000000000'
  },
  token: 'fauxToken',
  hashed_token: 'fauxHashedToken',
  token_last_eight: 'fauxTokenLastEight',
  note: 'opspark for macs-MacBook.local: cli util to install, setup, and grade student projects',
  note_url: 'https://www.npmjs.com/package/opspark',
  created_at: '2017-09-28T20:25:00Z',
  updated_at: '2017-09-28T20:25:00Z',
  scopes: [
    'public_repo',
    'repo',
    'gist'
  ],
  fingerprint: null,
  username: 'livrush',
};

const dummyUser = {
  login: 'livrush',
  id: 23201987,
  avatar_url: 'https://avatars3.githubusercontent.com/u/23201987?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/livrush',
  html_url: 'https://github.com/livrush',
  followers_url: 'https://api.github.com/users/livrush/followers',
  following_url: 'https://api.github.com/users/livrush/following{/other_user}',
  gists_url: 'https://api.github.com/users/livrush/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/livrush/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/livrush/subscriptions',
  organizations_url: 'https://api.github.com/users/livrush/orgs',
  repos_url: 'https://api.github.com/users/livrush/repos',
  events_url: 'https://api.github.com/users/livrush/events{/privacy}',
  received_events_url: 'https://api.github.com/users/livrush/received_events',
  type: 'User',
  site_admin: false,
  name: 'Liv',
  company: null,
  blog: 'real-deal.studio',
  location: 'New Orleans',
  email: 'w.phrush@gmail.com',
  hireable: true,
  bio: null,
  public_repos: 33,
  public_gists: 16,
  followers: 1,
  following: 0,
  created_at: '2016-11-01T23:43:08Z',
  updated_at: '2017-09-18T17:00:53Z'
};

describe('github', function () {
  before(function () {
    rimraf(applicationDirectory, function () {});
  });

  describe('#ensureApplicationDirectory()', function () {
    beforeEach(function () {
      rimraf(applicationDirectory, function () {});
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
    beforeEach(function () {
      rimraf(applicationDirectory, function () {});
    });

    it('should write auth file', function (done) {
      expect(fs.existsSync(authFilePath)).to.be.false;
      github.writeAuth(dummyAuth);
      expect(fs.existsSync(authFilePath)).to.be.true;
      expect()
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
    beforeEach(function () {
      rimraf(applicationDirectory, function () {});
    });

    it('should write user file', function (done) {
      expect(fs.existsSync(userFilePath)).to.be.false;
      github.writeUser(dummyUser);
      expect(fs.existsSync(userFilePath)).to.be.true;
      done();
    });

    it("should write correct information", function (done) {
      github.writeUser(dummyUser);
      let user = fs.readFileSync(userFilePath);
      user = JSON.parse(user);
      expect(user).to.eql(dummyUser);
      done();
    });
  });

  describe('#filesExist()', function () {
    beforeEach(function () {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
    });

    it('should return true if directory exists', function (done) {
      expect(github.filesExist()).to.be.true;
      done();
    });
  });

  describe('#deleteUserInfo()', function () {
    beforeEach(function () {
      github.writeAuth(dummyAuth);
      github.writeUser(dummyUser);
    });

    it('should return true if directory exists', function (done) {
      expect(github.filesExist()).to.be.true;
      github.deleteUserInfo();
      expect(github.filesExist()).to.be.false;
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


  describe('#promptForUserInfo', function () {
    const promptForUserInfo = github.promptForUserInfo;

    it('should return a promise', function () {
      expect(promptForUserInfo()).to.be.an.instanceof(Promise);
    });
  });

  describe.skip('#user()', function () {
    this.timeout(15000);
    it("returns valid github user", function (done) {
      github.user("jfraboni", function (err, user) {
        expect(user)
          .to.have.property("login")
          .and.to.equal("jfraboni");
        done();
      });
    });

    it("throws err if invalid github user", function (done) {
      github.user("*-^xyz", function (err, user) {
        expect(err).to.be.not.null;
        expect(user).to.be.undefined;
        done();
      });
    });
  });

  describe.skip('#repos()', function () {
    it('should obtain auth, then get all org repos', function (done) {
      github.repos(function (err, repos) {
        var names = _.map(repos, 'name');
        expect(names).to.include('circularity', 'frabonacci', 'line-crawler');
        done();
      });
    });
  });

  describe.skip('#limit()', function () {
    it('should return GitHub API rate-limit usage', function (done) {
      github.limit(function (err, msg) {
        console.log(msg);
        expect(msg).to.include('GitHub limit');
        done();
      });
    });
  });

  // deprecated: todo : remove //
  describe.skip('#listAuth()', function () {
    this.timeout(15000);
    it('should list valid GitHub auths for the user', function (done) {
      github.listAuths('jfraboni', function (err, stdout, stderr) {
        if (err) console.log(err);
        done();
      });
    });
  });

  /*
   * Run manually : depends on creds.
   */
  describe.skip('#authorize()', function () {
    this.timeout(30000);
    it('should authorize cli with github token', function (done) {
      var opsparkDir = github.getUserHome() + '/opspark';
      var filepath = opsparkDir + '/github';
      github.authorize('jfraboni', function () {
        assert(fs.existsSync(opsparkDir));
        assert(fs.existsSync(filepath));
        var auth = fsJson.loadSync(filepath);
        assert(_.has(auth, 'token'));
        done();
      });
    });
  });

  describe('#getNoteForHost()', function () {
    it('returns auth note unique to env', function (done) {
      var note = util.format(config.github.note, env.hostname());
      console.log(github.getNoteForHost());
      expect(github.getNoteForHost()).to.equal(note);
      done();
    });
  });

  /*
   * Run manually 
   */
  describe.skip('#findToken()', function () {
    it('looks for token key', function (done) {
      var filepath = github.getUserHome() + '/opspark/github';
      if (fs.existsSync(filepath)) {
        var auth = fsJson.loadSync(filepath);
        assert(_.has(auth, 'token'));

        // var hasToken = (data.indexOf('token') > -1);
        // assert(hasToken);
        done();
      }
    });
  });
});