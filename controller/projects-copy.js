'use strict';

var
  config = require('../config'),
  _ = require('lodash'),
  util = require('util'),
  Q = require('q'),
  fsJson = require('fs-json')(),
  changeCase = require('change-case'),
  async = require('async'),
  github = require('./github'),
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  fs = require('fs'),
  url = require('url'),
  exec = require('child_process').exec,
  request = require('request'),
  rp = require('request-promise'),
  mkdirp = require('mkdirp'),
  rimraf = require('rimraf'),
  cancelOption = '[cancel]',
  rootDirectory = './',
  projectEntriesPath = 'projects/projects.json';

function greenlightRequest() {
  const options = {
    method: 'GET',
    // uri: 'https://greenlight.operationspark.org/api/os/install',
    uri: 'http://localhost:3000/',
    json: true,
  };
  rp(options)
    .then(res => console.log(res))
    .catch(err => console.error('upload failed:', err));
}

greenlightRequest();

module.exports.install = function () {
  // get list of all projects
  list(function (err, projects) {
    if (err) return console.log(err + ''.red);
    // choose which project
    selectProject(projects, function (err, project) {
      if (err) return console.log(err + ''.red);
      installProject(project, null, function () {
        console.log('Have fun!!!'.green);
      });
    });
  });
};


// Gets list of projects currently installed
function listProjectsOf(username) {
  var deferred = Q.defer();
  var userRepo = username + '/' + username + '.github.io';
  var url = 'https://raw.githubusercontent.com/' + userRepo + '/master/projects/projects.json';

  var options = {
    url: url,
    headers: {
      'User-Agent': config.userAgent
    }
  };
  var onResponse = function (err, response, body) {
    if (err) deferred.reject(err);
    else deferred.resolve(JSON.parse(body).projects);
  };
  request(options, onResponse);
  return deferred.promise;
}
module.exports.listProjectsOf = listProjectsOf;

//
function list(complete) {
  console.log('Retrieving list of projects, please wait...'.green);
  github.repos(function (err, repos) {
    if (err) return complete(err);
    var projects = repos.filter(function (repo) {
      //console.log(repo.description.blue);
      return /PROJECT::/.test(repo.description);
    });
    complete(null, projects);
  });
}
module.exports.list = list;

function selectProject(projects, complete) {
  async.waterfall([
    function (next) {
      inquirer.prompt([{
        type: 'list',
        name: 'project',
        message: 'Select the project you wish to install',
        choices: _.pluck(projects, 'name').concat(cancelOption),
      }],
      function (response) {
        if(response.project === cancelOption) {
          console.log('Installation cancelled, bye bye!'.green);
          process.exit();
        }
        next(null, _.where(projects, {'name': response.project})[0]);
      });
    },
    function (project, next) {
      inquirer.prompt([{
        type: 'confirm',
        name: 'install',
        message: `You selected ${project.name}: Go ahead and install?`,
        default: true
      }],
      function (confirm) {
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

  console.log('Installing project %s, please wait...'.green, projectName);
  var uri = 'https://github.com/OperationSpark/' + projectName;
  console.log('Cloning %s, please wait...'.green, uri);

  var cmd = `svn co ${uri} ${projectDirectory}`;
  var child = exec(cmd, function (err, stdout, stderr) {
    if (err) return complete(err);
    console.log('Successfully cloned project!'.green);
    initializeProject(project, pairedWith, projectDirectory, complete);
  });
}
module.exports.installProject = installProject;

function initializeProject(project, pairedWith, projectDirectory, complete) {
  async.series(
    [
      // add revision number and remote //
      function (next) {
        removeGitRemnants(projectDirectory, next);
      },
      function (next) {
        if (program.master) return next();
        removeMaster(projectDirectory, next);
      },
      function (next) {
        if (program.master) return next();
        removeTest(projectDirectory, next);
      },
      function (next) {
        installBower(projectDirectory, next);
      },
      function (next) {
        appendProjectEntry(project, pairedWith, next);
      }
    ],
    function (err, result){
      if (err) return console.log(err + ''.red);
      console.log('Installation of project %s complete!'.blue, project.name);
      complete();
    }
  );
}
module.exports.initializeProject = initializeProject;

function appendProjectEntry(project, pairedWith, complete) {
  var projectEntries = loadOrCreateEntries();
  var e = _.where(projectEntries.projects, { 'name': project.name})[0];
  if (e) {
    console.log('Project entry exists for %s, skipping entry...'.green, project.name);
    return complete();
  }
  var entry = {
    name: project.name,
    title: changeCase.titleCase(project.name),
    description: project.description.replace('PROJECT:: ', ''),
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})
  };
  if (pairedWith) entry.pairedWith = [pairedWith];
  projectEntries.projects.push(entry);
  fsJson.saveSync(projectEntriesPath, projectEntries);
  console.log('Project entry for %s saved!'.green, project.name);
  complete();
}
module.exports.appendProjectEntry = appendProjectEntry;

function installBower(projectDirectory, complete) {
  if (!fs.existsSync(projectDirectory + '/bower.json')) return complete();
  console.log('Installing bower components, please wait...'.green);
  var exec = require('child_process').exec;
  var child = exec('cd ' + projectDirectory + ' && bower install -F', function (err, stdout, stderr) {
    if (err) throw err;
    console.log(stdout);
    console.log('Bower components installed for project %s!'.green, projectDirectory);
    complete();
  });
}
module.exports.installBower = installBower;
function removeGitRemnants(projectDirectory, complete) {
  var gitignore = projectDirectory + '/.gitignore';
  if (fs.existsSync(gitignore)) { fs.unlinkSync(gitignore); }
  rimraf(projectDirectory + '/.git', function (err) {
    if (err) return console.log(err);
    console.log('git remnants successfully removed from project %s'.green, projectDirectory);
    complete();
  });
}
module.exports.removeGitRemnants = removeGitRemnants;

function removeSvnRemnants(projectDirectory, complete) {
  rimraf(projectDirectory + '/.svn', function (err) {
    if (err) return console.log(err);
    console.log('svn remnants successfully removed from project %s'.green, projectDirectory);
    complete();
  });
}
module.exports.removeSvnRemnants = removeSvnRemnants;

function removeTest(projectDirectory, complete) {
  rimraf(projectDirectory + '/test', function (err) {
    if (err) return console.log(err);
    console.log('tests successfully removed from project %s'.green, projectDirectory);
    complete();
  });
}
module.exports.removeTest = removeTest;

function removeMaster(projectDirectory, complete) {
  rimraf(projectDirectory + '/.master', function (err) {
    if (err) return console.log(err);
    console.log('master successfully removed from project %s'.green, projectDirectory);
    complete();
  });
}
module.exports.removeMaster = removeMaster;

/*
 * uri should be something like:
 *      'https://github.com/jfraboni/jfraboni.github.io/trunk/projects/worm-hole'
 */
function download(uri, complete) {
    var deferred = Q.defer();
    var projectsDirectory = rootDirectory + 'projects';
    if (!fs.existsSync(projectsDirectory)) mkdirp.sync(projectsDirectory);

    var project = url.parse(uri).pathname.split('/').pop();
    var projectDirectory = projectsDirectory + '/' + project;

    if (fs.existsSync(projectDirectory)) { throw new Error(util.format('Project already exists: Hmm, looks like this project is already installed, you can verify this by checking your projects directory for %s. If you want to re-install this project, run the command "os delete %s"', project, project)); }

    var message = 'Downloading ' + project + ', please wait...';
    console.log(message.green);

    var cmd = 'svn checkout ' + uri + ' ' + projectDirectory;
    var child = exec(cmd, function (err, stdout, stderr) {
        if (err) return deferred.reject(err);
        message = project + ' downloaded to ' + projectDirectory;
        console.log(message.green);
        removeSvnRemnants(projectDirectory, function () {
            deferred.resolve();
        });
    });
    return deferred.promise.nodeify(complete);
}
module.exports.download = download;

function loadOrCreateEntries() {
    return fsJson.loadSync(projectEntriesPath) || {projects: []};
}
module.exports.loadOrCreateEntries = loadOrCreateEntries;
