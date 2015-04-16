var 
    config = require('../config'),
    fs = require('fs-extra'),
    chai = require('./helpers/chai'),
    sinon = require('sinon'),
    mocha = require('mocha'),
    stdin = require('mock-stdin').stdin(),
    pair = require('../controller/pair');
    
describe('pair', function() {
    describe('#up()', function() {
        this.timeout(15000);
        it('verifies github user, prompts for install, installs project, record username under project entry in opspark.json', function(done) {
            pair.up(function() {
                done();
            });
        });
    });
    
});