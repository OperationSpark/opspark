'use strict';

const _ = require('lodash');
const changeCase = require('change-case');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects-copy');
const submit = require('./submit');
const fs = require('fs');
const exec = require('child_process').exec;
const env = require('./env');

const rootDirectory = `${env.home()}/workspace`;
const projectsDirectory = `${rootDirectory}/projects`;

// Start of test command
// Runs the listProjectsOf function from projects to select project
// that user wants to be tested
function test(options, submitFlag) {
  let action = 'test';
  if (submitFlag) {
    action = 'submit';
  }

  projects.chooseClass(action, function(session, action) {
    let projectsList = session.PROJECT;
    projectsList.push({
      name: 'Lets Get Functional',
    })
    projectsList = findTestableProjects(projectsList, session.sessionId).sort(function(a,b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    });

    projects.selectProject(projectsList, grabTests, action, submitFlag);
  });
}

module.exports.test = test;


// Takes in projectsList
// Creates mappedProjects, which is array of project names
// Creates files, which is list of currently installed project names
// Creates testableProjects, intersection of mappedProjects and files
// Reduces and returns original projectsList to be only those in intersection
function findTestableProjects(projectsList, session) {
  const mappedProjects = _.map(projectsList, function (e) {
    return changeCase.paramCase(e.name);
  });
  const files = fs.readdirSync(projectsDirectory);
  const testableProjects = _.intersection(mappedProjects, files);
  return projectsList.reduce(function (seed, project) {
    if (testableProjects.indexOf(changeCase.paramCase(project.name)) > -1) {
      project._session = session;
      seed.push(project);
    }
    return seed;
  }, []);
}

// Runs svn export to download the tests for the specific project
// and places them in the correct directory
// Then calls setEnv
function grabTests(project, submitFlag) {
  const name = changeCase.paramCase(project.name);
  const directory = `${projectsDirectory}/${name}/test`;
  console.log(`Downloading tests for ${name}. . .`.green);
  // TODO: swap livrush to opspark
  const uri = `https://github.com/livrush/${name}`;
  // const uri = `https://github.com/OperationSpark/${project}`;
  const token = github.grabLocalToken();
  // TODO: swap branches/test to trunk
  const cmd = `svn export ${uri}/branches/test/test ${directory} --password ${token}`;
  // const cmd = `svn export ${uri}/trunk/test ${projectsDirectory}/${project} --password ${token}`
  if (fs.existsSync(directory)) {
    console.log('Skipping tests.'.green);
    setEnv(project, submitFlag);
  } else {
    exec(cmd, function (error) {
      if (error) return console.log(`There was an error. ${error}`);
      console.log('Successfully downloaded tests!'.green);
      setEnv(project, submitFlag);
    });
  }
}

// Originally a part of runTests
// Combines project name to the project directory
// Makes command to enter project directory
// Makes command to install npm dependencies
// Attempted to use node's process module to change directory, did not work
// Attempts to run both commands together with promisified child_process
// If error, runs postTestCleanup to delete new directories so students can't have them
// If no error, calls runTests function
function setEnv(project, submitFlag) {
  const name = changeCase.paramCase(project.name);
  const directory = `${projectsDirectory}/${name}/node_modules`;
  console.log('Installing dependencies. . .'.green);
  // const directory = `${projectsDirectory}/${name}/`;
  const enterDirectory = `cd ${projectsDirectory}/${name}/`;
  const installDependencies = 'npm install';
  const cmd = `${enterDirectory} && ${installDependencies}`;
  if (fs.existsSync(directory)) {
    console.log('Skipping dependencies.'.green);
    runTests(project, submitFlag);
  } else {
    exec(cmd, function (err) {
      if (err) {
        console.log('There was an error installing dependencies, show this to your teacher:'.red, err);
        return postTestCleanup(project);
      }
      console.log('Successfully installed dependencies!'.green);
      runTests(project, submitFlag);
    });
  }
}

// Creates command to enter project directory
// Creates command to run tests
// Command has been everything from 'npm run test', to literally the
// script in 'npm run test', to this current version with absolute directory
// May need --use_strict tag, but that throws an error (exit with code 9, unknown argument)
// when used with other commands
// If error, runs postTestCleanup to delete new directories so students can't have them
// If no error, calls postTestCleanup function
function runTests(project, submitFlag) {
  const name = changeCase.paramCase(project.name);
  console.log('Running tests. . .'.green);
  // const directory = `${projectsDirectory}/${project}`;
  const enterDirectory = `cd ${projectsDirectory}/${name}/`;
  const runProjectTests = 'npm test';
  const cmd = `${enterDirectory} && ${runProjectTests}`;
  exec(cmd, function (err, stdout) {
    // console.log(stdout);
    const obj = JSON.parse(stdout.slice(stdout.indexOf(`{
  "stats": {`)));
    const stats = obj.stats;
    console.log(` Total tests:    ${stats.tests}  `.bgBlack.white);
    console.log(` Passing tests:  ${stats.passes}  `.bgBlue.white);
    console.log(` Pending tests:  ${stats.pending}  `.bgYellow.white);
    console.log(` Failing tests: ${stats.failures}  `.bgRed.white);
    if (submitFlag) {
      submit.checkGrade(project, stats);
    } else if (stats.failures > 0) {
      const failures = obj.failures;
      failures.forEach(function (currentTest, i) {
        const whichTest = currentTest.fullTitle;
        const stackLineOne = currentTest.err.stack.split('\n')[0];
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
  const name = changeCase.paramCase(project.name);
  const removeTests = `rm -rf ${projectsDirectory}/${name}/test`;
  const removeNodeModules = `rm -rf ${projectsDirectory}/${name}/node_modules`;
  const cmd = `${removeTests} && ${removeNodeModules}`;
  exec(cmd, () => console.log('Tests and Node Modules removed!'.green));
}
