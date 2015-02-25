#! /usr/bin/env node

'use strict';

var 
    _ = require('lodash'),
    fsJson = require('fs-json')(),
    async = require('async'),
    github = require('octonode'),
    client = github.client(),
    opspark = client.org('OperationSpark'),
    program = require('commander'),
    inquirer = require("inquirer"),
    colors = require('colors'),
    clone = require('nodegit').Clone.clone,
    fs = require('fs'),
    rimraf = require('rimraf'),
    cancelOption = '[cancel]',
    projectEntriesPath = '.projects.json';

program    
    .option('-m, --master', 'Keep master files')
    .version('0.0.1')
    .command('install')
    .description('List installable projects.')
    .action(list);

program.parse(process.argv);

function list() {
    console.log('Retrieving list of projects, please wait...'.green);
    var names = [];
    
    opspark.repos(1, 100, function (err, repos) {
        if (err) return console.log(err + ''.red);
        var projects = repos.filter(function (repo) {
            //console.log(repo.description.blue);
            return /PROJECT::/.test(repo.description);
        });
        
        promptForInstall(projects);
    });
}

function promptForInstall(projects) {
    async.waterfall([
        function(next) {
            inquirer.prompt([{
                type: "list",
                name: "project",
                message: "Select the project you wish to install",
                choices: _.pluck(projects, 'name').concat(cancelOption)}], 
                function(response) {
                    if(response.project === cancelOption) {
                        console.log('Installtion cancelled, bye bye!'.green);
                        process.exit();
                    }
                    next(null, _.where(projects, {'name': response.project})[0]);
            });
        },
        function(project, next) {
            inquirer.prompt([{
                        type: "confirm",
                        name: "install",
                        message: "You selected " + project.name + ": Go ahead and install?",
                        default: true
                }],
                function(confirm) {
                    if (confirm.install) { installProject(project); }
                });
        }
    ]);
}

function installProject(project) {
    // TODO : Provide overloadeded method to install with name //
    //if (!projectName) return list();
    var projectName = project.name;
    
    if (fs.existsSync(__dirname + '/' + projectName)) return console.log('Project %s already installed! Please delete manually before reinstalling, or install another project.', projectName);
    
    console.log('Installing project %s... please wait...'.green, projectName);
    var uri = 'https://github.com/OperationSpark/' + projectName;
    
    clone(uri, projectName, null)
        .then(function(repo) {
            console.log('Successfully cloned project!'.green);
            async.series(
                [
                    function (next) {
                        removeGitRemnants(projectName, next);
                    },
                    function (next) {
                        if (program.master) return next();
                        removeMaster(projectName, next);
                    },
                    function (next) {
                        installBower(projectName, next);
                    },
                    function (next) {
                        appendProjectEntry(project, next);
                    }
                ],
                function(err, result){
                    if (err) return console.log(err + ''.red);
                    console.log('Installation of project %s complete! Have fun!!!'.blue, projectName);
                }
            );
        }, function (err) {
            console.log(err);
        });
}

function appendProjectEntry(project, callback) {
    var projectEntries = fsJson.loadSync(projectEntriesPath);
    projectEntries = (projectEntries ? projectEntries : {projects: []});
    projectEntries.projects.push({
        name: project.name, 
        description: project.description.replace('PROJECT:: ', ''), 
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})
    });
    fsJson.saveSync(projectEntriesPath, projectEntries);
    console.log('Project entry saved!'.green);
    callback();
}

function installBower(project, callback) {
    if (!fs.existsSync(project + '/bower.json')) return callback();
    console.log('Installing bower components, please wait...'.green);
    var exec = require('child_process').exec;
    var child = exec('cd ' + project + ' && bower install -F', function(err, stdout, stderr) {
        if (err) throw err;
        console.log(stdout);
        console.log('Bower components installed for project %s!'.green, project);
        callback();
    });
}

function removeGitRemnants(projectName, callback) {
    fs.unlinkSync(projectName + '/.gitignore');
    rimraf(projectName + '/.git', function (err) {
        if (err) return console.log(err);
        console.log('git remnants successfully removed from project %s'.green, projectName);
        callback();
    });
}

function removeMaster(projectName, callback) {
    rimraf(projectName + '/.master', function (err) {
        if (err) return console.log(err);
        console.log('master successfully removed from project %s'.green, projectName);
        callback();
    });
}
