var 
    chai = require('./helpers/chai'),
    sinon = require('sinon'),
    mocha = require('mocha'),
    should = require('should'),
    os = require('os'),
    env = require('../controller/env');
    
describe('env', function() {
    afterEach(function () {
        
    });
    
    describe('#home()', function() {
        it('should return home dir of user, platform independent', function(done) {
            var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
            expect(env.home()).to.equal(home);
            done();
        });
    });
    
    describe('#hostname()', function() {
        it('should return the hostname, platform independent', function(done) {
            var hostname = os.hostname();
            expect(env.hostname()).to.equal(hostname);
            done();
        });
    });
});