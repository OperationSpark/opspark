'use strict';

var 
    _ = require('lodash'),
    fsJson = require('fs-json')(),
    changeCase = require('change-case'),
    async = require('async'),
    github = require('octonode'),
    client = github.client(),
    opspark = client.org('OperationSpark'),
    program = require('commander'),
    inquirer = require("inquirer"),
    colors = require('colors'),
    clone = require('nodegit').Clone.clone,
    fs = require('fs'),
    url = require('url'),
    exec = require('child_process').exec,
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    cancelOption = '[cancel]',
    rootDirectory = './',
    projectEntriesPath = 'projects/projects.json';

module.exports.install = function() {
    list(function (err, projects) {
        if (err) return console.log(err + ''.red);
        selectProject(projects, function(err, project) {
            if (err) return console.log(err + ''.red);
            installProject(project, null, function () {
                
            });
        });
    });
};

function list(next) {
    console.log('Retrieving list of projects, please wait...'.green);
    opspark.repos(1, 100, function (err, repos) {
        if (err) return next(err);
        var projects = repos.filter(function (repo) {
            //console.log(repo.description.blue);
            return /PROJECT::/.test(repo.description);
        });
        next(null, projects);
    });
}
module.exports.list = list;

function selectProject(projects, complete) {
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
                    if (confirm.install) return complete(null, project);
                    selectProject(projects, complete);
                });
        }
    ]);
}
module.exports.selectProject = selectProject;

function installProject(project, pairedWith, complete) {
    var projectName = project.name;
    var projectsDirectory = rootDirectory + 'projects';
    if (!fs.existsSync(projectsDirectory)) mkdirp.sync(projectsDirectory);
    var projectDirectory = projectsDirectory + '/' + projectName;
    if (fs.existsSync(projectDirectory)) return console.log('Project %s already installed! Please delete manually before reinstalling, or install another project.', projectName);
    
    console.log('Installing project %s... please wait...'.green, projectName);
    var uri = 'https://github.com/OperationSpark/' + projectName;
    
    clone(uri, projectDirectory, null)
        .then(function(repo) {
            console.log('Successfully cloned project!'.green);
            async.series(
                [
                    function (next) {
                        removeGitRemnants(projectDirectory, next);
                    },
                    function (next) {
                        if (program.master) return next();
                        removeMaster(projectDirectory, next);
                    },
                    function (next) {
                        installBower(projectDirectory, next);
                    },
                    function (next) {
                        appendProjectEntry(project, pairedWith, next);
                    }
                ],
                function(err, result){
                    if (err) return console.log(err + ''.red);
                    console.log('Installation of project %s complete! Have fun!!!'.blue, projectName);
                    complete();
                }
            );
        }, function (err) {
            console.log(err);
        });
}
module.exports.installProject = installProject;

function appendProjectEntry(project, pairedWith, complete) {
    var projectEntries = fsJson.loadSync(projectEntriesPath);
    projectEntries = (projectEntries ? projectEntries : {projects: []});
    var entry = {
        name: project.name, 
        title: changeCase.titleCase(project.name),
        description: project.description.replace('PROJECT:: ', ''), 
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})
    };
    if (pairedWith) entry.pairedWith = pairedWith;
    projectEntries.projects.push(entry);
    fsJson.saveSync(projectEntriesPath, projectEntries);
    console.log('Project entry saved!'.green);
    complete();
}

function installBower(projectDirectory, complete) {
    if (!fs.existsSync(projectDirectory + '/bower.json')) return complete();
    console.log('Installing bower components, please wait...'.green);
    var exec = require('child_process').exec;
    var child = exec('cd ' + projectDirectory + ' && bower install -F', function(err, stdout, stderr) {
        if (err) throw err;
        console.log(stdout);
        console.log('Bower components installed for project %s!'.green, projectDirectory);
        complete();
    });
}

function removeGitRemnants(projectDirectory, complete) {
    var gitignore = projectDirectory + '/.gitignore';
    if (fs.existsSync(gitignore)) { fs.unlinkSync(gitignore); }
    rimraf(projectDirectory + '/.git', function (err) {
        if (err) return console.log(err);
        console.log('git remnants successfully removed from project %s'.green, projectDirectory);
        complete();
    });
}

function removeSvnRemnants(projectDirectory, complete) {
    rimraf(projectDirectory + '/.svn', function (err) {
        if (err) return console.log(err);
        console.log('svn remnants successfully removed from project %s'.green, projectDirectory);
        complete();
    });
}

function removeMaster(projectDirectory, complete) {
    rimraf(projectDirectory + '/.master', function (err) {
        if (err) return console.log(err);
        console.log('master successfully removed from project %s'.green, projectDirectory);
        complete();
    });
}

function download(uri, complete) {
    var projectsDirectory = rootDirectory + 'projects';
    if (!fs.existsSync(projectsDirectory)) mkdirp.sync(projectsDirectory);
    
    var project = url.parse(uri).pathname.split('/').pop();
    var projectDirectory = projectsDirectory + '/' + project;
    var message = 'Downloading ' + project + ', please wait...';
    console.log(message.green);
    
    var cmd = 'svn checkout ' + uri + ' ' + projectDirectory;
    var child = exec(cmd, function(err, stdout, stderr) {
        if (err) return complete(err);
        message = project + ' downloaded to ' + projectDirectory;
        console.log(message.green);
        removeSvnRemnants(projectDirectory, complete);
    });
}
module.exports.download = download;