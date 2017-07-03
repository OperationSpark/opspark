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
  projects = require('./projects-copy'),
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  fs = require('fs'),
  url = require('url'),
  exec = require('child_process').exec,
  execP = require('./child').execute,
  request = require('request'),
  mkdirp = require('mkdirp'),
  rimraf = require('rimraf'),
  cancelOption = '[cancel]',
  rootDirectory = './',
  projectsDirectory = '~/workspace/projects',
  projectEntriesPath = 'projects/projects.json';

module.exports.test = function() {
  const username = github.grabLocalLogin();
  console.log(username);
  // const installedProjects = projects.listProjectsOf(username);
  projects.listProjectsOf(username)
    .then(function (installedProjects) {
      projects.selectProject(installedProjects, grabTests, 'test');
    });
};

function grabTests(err, project) {
  console.log(`Downloading tests for ${project.name}. . .`.green);
  // TODO: swap livrush to opspark
  const uri = `https://github.com/livrush/${project.name}`;
  // const uri = `https://github.com/OperationSpark/${project}`;
  const token = github.grabLocalToken();
  // TODO: swap branches/test to trunk
  const cmd = `svn export ${uri}/branches/test/test ${projectsDirectory}/${project.name}/test --password ${token}`;
  // const cmd = `svn export ${uri}/trunk/test ${projectsDirectory}/${project} --password ${token}`
  exec(cmd, function (err, stdout, stderr) {
    if (err) return console.log(`There was an error. ${err}`);
    console.log('Successfully downloaded tests!'.green);
    setEnv(project.name);
  });
}

function setEnv(project) {
  const enterDirectory = `cd ${projectsDirectory}/${project}/`;
  const installDependencies = 'npm i';
  // TODO: command breaks when running tests
  // const cmd = `${enterDirectory} && ${installDependencies} && ${runProjectTests} && ${leaveDirectory}`;
  const cmd = `${enterDirectory} && ${installDependencies}`;
  execP(cmd).then(function (err, stdout, stderr) {
    if (err) {
      console.log(err, 'this is my error in run test');
      return postTestCleanup(project);
    }
    console.log('Successfully installed dependencies!'.green);
    runTests(project);
  });
}

function runTests(project) {
  const enterDirectory = `cd ${projectsDirectory}/${project}/`;
  const runProjectTests = `mocha -t ${projectsDirectory}/${project}/test/index.spec.js`;
  // const leaveDirectory = 'cd ~/workspace/';
  const cmd = `${enterDirectory} && ${runProjectTests}`;
  execP(cmd).then(function (err, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (err) {
      console.log(err, 'this is my error in run test');
      return postTestCleanup(project);
    }
    console.log('Successfully ran tests!'.green);
    postTestCleanup(project);
  });
}

function postTestCleanup(project) {
  const removeTests = `rm -rf ${projectsDirectory}/${project}/test`;
  const removeNodeModules = `rm -rf ${projectsDirectory}/${project}/node_modules`;
  const cmd = `${removeTests} && ${removeNodeModules}`;
  execP(cmd).then(function(err, stdout, stderr) {
    if (err) console.log(err);
    console.log('Tests and Node Modules removed!'.green);
  });
  //
  // rimraf(`${projectsDirectory}/${project}/test`, function () {
  //   console.log('Test directory removed!'.green);
  //   rimraf(`${projectsDirectory}/${project}/node_modules`, function () {
  //     console.log('Node Modules removed!'.green);
  //   });
  // });
}
