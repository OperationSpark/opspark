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
  env = require('./env'),
  rootDirectory = `${env.home()}/workspace`,
  projectsDirectory = `${rootDirectory}/projects`,
  projectEntriesPath = `${projectsDirectory}/projects.json`;

// Start of test command
// Runs the listProjectsOf function from projects to select project
// that user wants to be tested
module.exports.test = function() {
  const username = github.grabLocalLogin();
  // const installedProjects = projects.listProjectsOf(username);
  projects.listProjectsOf(username)
    .then(function (installedProjects) {
      projects.selectProject(installedProjects, grabTests, 'test');
    });
};

// Runs svn export to download the tests for the specific project
// and places them in the correct directory
// Then calls setEnv
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

// Originally a part of runTests
// Combines project name to the project directory
// Makes command to enter project directory
// Makes command to install npm dependencies
// Attempted to use node's process module to change directory, did not work
// Attempts to run both commands together with promisified child_process
// If error, runs postTestCleanup to delete new directories so students can't have them
// If no error, calls runTests function
function setEnv(project) {
  console.log('Installing dependencies. . .'.green);
  const directory = `${projectsDirectory}/${project}/`;
  const enterDirectory = `cd ${projectsDirectory}/${project}/`;
  const installDependencies = 'npm install';
  const cmd = `${enterDirectory} && ${installDependencies}`;
  exec(cmd, function (err) {
    if (err) {
      console.log('There was an error installing dependencies, show this to your teacher:'.red, err);
      return postTestCleanup(project);
    }
    console.log('Successfully installed dependencies!'.green);
    runTests(project);
  });
}

// Creates command to enter project directory
// Creates command to run tests
  // Command has been everything from 'npm run test', to literally the
  // script in 'npm run test', to this current version with absolute directory
    // May need --use_strict tag, but that throws an error (exit with code 9, unknown argument)
    // when used with other commands
// If error, runs postTestCleanup to delete new directories so students can't have them
// If no error, calls postTestCleanup function
function runTests(project) {
  console.log('Running tests. . .'.green);
  const directory = `${projectsDirectory}/${project}`;
  const enterDirectory = `cd ${projectsDirectory}/${project}/`;
  const runProjectTests = 'npm test';
  const cmd = `${enterDirectory} && ${runProjectTests}`;
  exec(cmd, function (err, stdout, stderr) {
    if (!!stderr) {
      console.log('There was an error running tests, show this to your teacher:'.red, err);
    } else {
      console.log('Successfully ran tests!'.green);
    }
    const obj = JSON.parse(stdout.slice(stdout.indexOf(`{
  "stats": {`)));
    const stats = obj.stats;
    console.log(` Total tests:    ${stats.tests}  `.bgBlack.white);
    console.log(` Passing tests:  ${stats.passes}  `.bgGreen.white);
    console.log(` Pending tests:  ${stats.pending}  `.bgBlue.white);
    console.log(` Failing tests: ${stats.failures}  `.bgRed.white);
    if (stats.failures > 0) {
      const failures = obj.failures;
      failures.forEach(function (test, i) {
        const whichTest = test.fullTitle;
        const stackLineOne = test.err.stack.split('\n')[0];
        const errorInfo = stackLineOne.slice(stackLineOne.indexOf(':'));
        console.log(`${i + 1}) ${whichTest}`.red.bold.underline);
        console.log(`> > > ${errorInfo}`.grey);
      });
    } else {
      console.log('You did it! 100% complete, now please run'.green, 'os submit'.red);
    }
    postTestCleanup(project);
  });
}

// Removes unnecessary test and node_modules directory
// Attempted to use rimraf, but did not work
function postTestCleanup(project) {
  const removeTests = `rm -rf ${projectsDirectory}/${project}/test`;
  const removeNodeModules = `rm -rf ${projectsDirectory}/${project}/node_modules`;
  const cmd = `${removeTests} && ${removeNodeModules}`;
  exec(cmd, () => console.log('Tests and Node Modules removed!'.green));
}
