var 
    config = require('../config'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    fsJson = require('fs-json')(),
    chai = require('./helpers/chai'),
    sinon = require('sinon'),
    mocha = require('mocha'),
    should = require('should'),
    colors = require('colors'),
    github = require('../controller/github');
    
describe('github', function() {
    afterEach(function () {
        
    });
    
    describe.skip('#user()', function() {
        this.timeout(15000);
        it('returns valid github user', function(done) {
            github.user('jfraboni', function(err, user) {
                expect(user).to.have.property('login').and.to.equal('jfraboni');
                done();
            });
        });
        
        it('throws err if invalid github user', function(done) {
            github.user('*-^xyz', function(err, user) {
                expect(err).to.be.not.null;
                expect(user).to.be.undefined;
                done();
            });
        });
        
    });
    
    describe('#projects()', function() {
        this.timeout(3000);
        it('returns valid projects.json for user', function(done) {
            github.projects('jfraboni', function(err, user) {
                //expect(user).to.have.property('login').and.to.equal('jfraboni');
                done();
            });
        });
    });
    
    describe('#writeToken()', function() {
        it('should create dir if none, and write token', function(done) {
            github.writeToken({token: "foo"});
            assert(fs.existsSync('../opspark'));
            assert(fs.existsSync('../opspark/github'));
            done();
        });
    });
    
    describe.skip('#repos()', function() {
        it('should obtain auth, then get all org repos', function(done) {
            github.repos(function (err, repos) {
                var names = _.pluck(repos, 'name');
                expect(names).to.include('circularity', 'frabonacci', 'line-crawler');
                done();
            });
        });
    });
    
    describe.skip('#limit()', function() {
        it('should return GitHub API rate-limit usage', function(done) {
            github.limit(function (err, msg) {
                console.log(msg);
                expect(msg).to.include('GitHub limit');
                done();
            });
        });
    });
    
    describe.skip('#listAuth()', function() {
        this.timeout(15000);
        it('should list valid GitHub auths for the user', function(done) {
            github.listAuths('jfraboni', function (err, stdout, stderr) {
                if (err) console.log(err);
                done();
            });
        });
    });
    
    /*
     * Run manually : depends on env and OS
     */
    describe.skip('#getUserHome()', function() {
        it('should return home dir of user, platform independent', function(done) {
            var userhome = github.getUserHome();
            console.log(userhome);
            expect(userhome).to.include('/home/ubuntu');
            done();
        });
    });
    
    /*
     * Run manually : depends on creds.
     */
    describe.skip('#authorize()', function() {
        this.timeout(30000);
        it('should authorize cli with github token', function(done) {
            var opsparkDir = github.getUserHome() + '/opspark';
            var filepath = opsparkDir + '/github';
            github.authorize('jfraboni', function() {
                assert(fs.existsSync(opsparkDir));
                assert(fs.existsSync(filepath));
                var auth = fsJson.loadSync(filepath);
                assert(_.has(auth, 'token'));
                done();
            });
        });
    });
    
    /*
     * Run manually 
     */
    describe.skip('#findToken()', function() {
        it('looks for token key', function(done) {
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
