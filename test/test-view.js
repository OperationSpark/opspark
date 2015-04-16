var 
    config = require('../config'),
    fs = require('fs-extra'),
    chai = require('./helpers/chai'),
    sinon = require('sinon'),
    mocha = require('mocha'),
    stdin = require('mock-stdin').stdin(),
    view = require('../view');
    
describe('view', function() {
    after(function(){
        stdin.restore();
    });
    
    describe('#promptForInput()', function() {
        this.timeout(15000);
        var message = config.github.msg.enterUsername;
        it('returns requested input from stdin', function(done) {
            view.promptForInput(message, function(err, username){
                expect(err).to.be.null;
                expect(username).to.equal('jfraboni');
                done();
            });
            stdin.send("jfraboni\n", "ascii");
            stdin.send("Y\n", "ascii");
        });
        
        it('recursively allows user to re-enter input from stdin', function(done) {
            view.promptForInput(message, function(err, username){
                expect(err).to.be.null;
                expect(username).to.equal('jfraboni');
                done();
            });
            stdin.send("jbaloni\n", "ascii");
            stdin.send("n\n", "ascii");
            stdin.send("jfraboni\n", "ascii");
            stdin.send("Y\n", "ascii");
        });
    });
});
