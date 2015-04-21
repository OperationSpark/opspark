var 
    _ = require('lodash'),
    config = require('../config'),
    fs = require('fs-extra'),
    chai = require('./helpers/chai'),
    sinon = require('sinon'),
    mocha = require('mocha'),
    should = require('should'),
    colors = require('colors'),
    stdin = require('mock-stdin').stdin(),
    projects = require('../controller/projects');
    
describe('projects', function() {
    after(function(){
        stdin.restore();
    });
    
    // REQUIRES AUTH //
    describe.skip('#list()', function() {
        this.timeout(3000);
        it('returns loosely valid list of projects from github.com/OperationSpark', function(done) {
            projects.list(function(err, projects) {
                var names = _.pluck(projects, 'name');
                expect(names).to.include('circularity', 'frabonacci', 'line-crawler');
                done();
            });
        });
    });
    
    describe.skip('#download()', function() {
        this.timeout(15000);
        
        it('should download a project or any directory', function(done) {
            // https://raw.githubusercontent.com/jfraboni/jfraboni.github.io/tree/master/frabonacci
            //https://api.github.com/repos/#{sql_repo_owner}/#{sql_repo_name}/contents#{sql_path}"
            projects.download('https://github.com/jfraboni/jfraboni.github.io/trunk/frabonacci', function(err) {
                // test files exist //
                // expect(project.id).to.equal(29655824);
                // expect(project.name).to.equal('line-crawler');
                done();
            });
            
        });
        
    });
    
    // need to figure out mocking stdin in this case - but do we need to test this anyway?  According to Inquirers test, this is already covered //
    describe.skip('#selectProject()', function() {
        this.timeout(15000);
        
        var mockProjects = [
            {id: 29655824, name: 'line-crawler'}, 
            {id: 29925564, name: 'circularity'}, 
            {id: 30997229, name: 'worm-hole'}];
            
        it('allows user to select a project', function(done) {
            projects.selectProject(mockProjects, function(err, project) {
                expect(project.id).to.equal(29655824);
                expect(project.name).to.equal('line-crawler');
                done();
            });
            stdin.send("\n", "ascii");
            // stdin.end();
        });
    });
    
});
