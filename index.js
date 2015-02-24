#! /usr/bin/env node

'use strict';

var 
    lodash = require('lodash'),
    async = require('async'),
    github = require('octonode'),
    client = github.client(),
    opspark = client.org('OperationSpark'),
    program = require('commander'),
    inquirer = require("inquirer"),
    colors = require('colors'),
    clone = require('nodegit').Clone.clone,
    fs = require('fs'),
    rimraf = require('rimraf');

program
    .version('0.0.1');
    
program    
    .command('list')
    .description('List installable projects.')
    .action(list);
    
program    
    .command('install [project]')
    .description('Install an Operation Spark project into your website workspace.')
    .action(installProject);
    
program.parse(process.argv);

function list() {
    console.log('Retrieving list of projects, please wait...'.green);
    var names = [];
    
    opspark.repos(1, 100, function (err, repos) {
        if (err) return console.log(err.red);
        var projects = repos.filter(function (repo) {
            //console.log(repo.description.blue);
            return /PROJECT::/.test(repo.description);
        });
        
        projects.forEach(function (repo) {
            names.push(repo.name);
        });
        
        promptForInstall(names);
    });
}

function promptForInstall(names) {
    var promptFor = [{
        type: "list",
        name: "project",
        message: "Select the project you wish to install",
        choices: names
    }];
    
    inquirer.prompt(promptFor, function(response) {
        installProject(response.project);
    });
}

function installProject(project) {
    if (fs.existsSync(__dirname + '/' + project)) return console.log('Project %s already installed! Please delete manually before reinstalling, or install another project.', project);
    
    console.log('Installing project %s... please wait...'.green, project);
    var uri = 'https://github.com/OperationSpark/' + project;
    
    clone(uri, project, null)
        .then(function(repo) {
            console.log('Successfully cloned project!'.green);
            async.series(
                [
                    function (next) {
                        removeGitRemnants(project, next);
                    },
                    function (next) {
                        installBower(project, next);    
                    }
                ],
                function(error, result){
                    console.log('final');
                    console.log(result);
                }
            );
        }, function (err) {
            console.log(err);
        });
}

function installBower(project, callback) {
    console.log('Installing bower components, please wait...'.green);
    var exec = require('child_process').exec;
    var child = exec('cd ' + project + ' && bower install -F', function(err, stdout, stderr) {
        if (err) throw err;
        console.log(stdout);
        console.log('Installation of project %s complete! Have fun!!!'.blue, project);
        callback();
    });
}

function removeGitRemnants(project, callback) {
    fs.unlinkSync(project + '/.gitignore');
    rimraf(project + '/.git', function (err) {
        if (err) return console.log(err);
        console.log('git remnants successfully removed from project %s'.green, project);
        callback();
    });
}
