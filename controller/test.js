'use strict';

require('colors');
const fs = require('fs');
const changeCase = require('change-case');
const exec = require('child_process').exec;

const env = require('./env');
const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const sessions = require('./sessions');
const projects = require('./projects');
const { downloadProjectTests, downloadProjectPackage, makeTestScript } = require('./helpers');

const rootDirectory = `${env.home()}/workspace`;
const projectsDirectory = `${rootDirectory}/projects`;

// Start of test command
// Runs the listProjectsOf function from projects to select project
// that user wants to be tested
function test() {
  console.log('Beginning test process!'.blue);
  projects.action = 'test';
  github.getCredentials()
    .catch(janitor.error('Failure getting credentials'.red))
    .then(greenlight.getSessions)
    .catch(janitor.error('Failure getting sessions'.red))
    .then(sessions.selectSession)
    .catch(janitor.error('Failure selecting session'.red))
    .then(projects.selectProject)
    .catch(janitor.error('Failure selecting project'.red))
    .then(grabTests)
    .catch(janitor.error('Failure grabbing tests'.red))
    .then(runTests)
    .catch(janitor.error('Failure running tests'.red))
    .then(displayResults)
    .catch(janitor.error('Failure displaying results'.red))
    .then(() => console.log('Successfully concluded test.'.blue))
    .catch((err) => { console.error(err); });
}

module.exports.test = test;

// Runs svn export to download the tests for the specific project
// and places them in the correct directory
// Then calls setEnv
function grabTests(project) {
  return new Promise(function (res, rej) {
    const name = changeCase.paramCase(project.name);
    console.log(`Downloading tests for ${name}. . .`.yellow);
    const directory = `${projectsDirectory}/${name}`;
    const cmd = downloadProjectTests(project.url, github.grabLocalAuthToken(), directory);
    const pckgCmd = downloadProjectPackage(project.url, github.grabLocalAuthToken(), directory);
    if (fs.existsSync(`${directory}/test`)) {
      console.log('Skipping tests.'.green);
      res(project);
    } else {
      exec(cmd, function (error) {
        if (error) return rej(error);
        console.log('Successfully downloaded tests!'.green);
        if (!fs.existsSync(`${directory}/package.json`)) {
          console.log(`Downloading Package.json for ${name}. . .`.yellow);
          exec(pckgCmd, function () {
            console.log('Package.json successfully installed'.green);
            res(project);
          });
        } else {
          res(project);
        }
      });
    }
  });
}

module.exports.grabTests = grabTests;


// Creates command to enter project directory
// Creates command to run tests
// Command has been everything from 'npm run test', to literally the
// script in 'npm run test', to this current version with absolute directory
// May need --use_strict tag, but that throws an error (exit with code 9, unknown argument)
// when used with other commands
// If error, runs postTestCleanup to delete new directories so students can't have them
// If no error, calls postTestCleanup function
function runTests(project) {
  return new Promise(function (res, rej) {
    const name = changeCase.paramCase(project.name);
    console.log('Running tests. . .'.yellow);
    const directory = `${projectsDirectory}/${name}/`;
    const cmd = makeTestScript(directory);
    exec(cmd, function (err, stdout, stderr) {
      if (stderr) {
        rej(stderr);
      }
      // The split variable MUST have EXACTLY TWO spaces before "stats"
      const split = `{
  "stats": {`;
      const index = stdout.indexOf(split);
      if (index === -1) {
        console.log('There was an error.'.red, err);
      } else {
        const parsedStdout = JSON.parse(stdout.slice(index));
        const stats = parsedStdout.stats;
        console.log(` Total tests:    ${stats.tests}  `.bgBlack.white);
        console.log(` Passing tests:  ${stats.passes}  `.bgBlue.white);
        console.log(` Pending tests:  ${stats.pending}  `.bgYellow.black);
        console.log(` Failing tests:  ${stats.failures}  `.bgRed.white);
        res({ project, parsedStdout });
      }
    });
  });
}

module.exports.runTests = runTests;

function displayResults({ parsedStdout }) {
  return new Promise(function (res) {
    if (parsedStdout.stats.failures > 0) {
      const failures = parsedStdout.failures;
      failures.forEach(function (currentTest, i) {
        const whichTest = currentTest.fullTitle;
        const message = currentTest.err.message;
        const stack = currentTest.err.stack.split('\n');
        const stackLineOne = stack[0];
        const stackLineTwo = stack[1];
        const errorInfo = stackLineOne.slice(stackLineOne.indexOf(':'));
        console.log(`${i + 1}) ${whichTest}`.red.bold.underline);
        console.log(`> > > ${message}`.red);
        console.log(`> > > ${errorInfo}`.grey);
        console.log(`> > > ${stackLineTwo}`.grey);
      });
      res({ pass: false });
    } else {
      console.log('You did it! 100% complete, now please run'.green, 'os submit'.red);
      res({ pass: true });
    }
  });
}

module.exports.displayResults = displayResults;
