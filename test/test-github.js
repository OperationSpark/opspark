var 
    config = require('../config'),
    fs = require('fs-extra'),
    chai = require('./helpers/chai'),
    sinon = require('sinon'),
    mocha = require('mocha'),
    should = require('should'),
    colors = require('colors'),
    github = require('../controller/github');
    
describe('github', function() {
    afterEach(function () {
        
    });
    
    describe('#user()', function() {
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
    
    /* LOOKS LIKE THERES ISSUES TESTING WITH PROMPT:
     * might be because it's using another process to collect stdrin
     */
    describe.skip('#promptForCreds()', function() {
        this.timeout(15000);
        it('prompts user for creds', function(done) {
            github.promptForCreds(function(err, creds) {
                //expect(user).to.have.property('login').and.to.equal('jfraboni');
                done();
            });
        });
    });
    
});
