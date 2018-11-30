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
const report = require('./reporter');
const {
  downloadProjectTests,
  downloadProjectPackage,
  installProjectDependencies,
  removeProjectTests,
  execAsync,
} = require('./helpers');

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
    .then(greenlight.getGradable)
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


// Creates command to install deps (`npm install`)
// Creates command to remove deps (`rm -rf`)
// > Install deps
// > Run tests
// > Log total/passing/pending/failing
// > If error, remove test directory and re-throw error
// > If no error, remove test directory and resolve with tests
function runTests(project) {
  const name = changeCase.paramCase(project.name);
  const directory = `${projectsDirectory}/${name}`;
  const testDirectory = `${directory}/test/`;
  
  const installProjectDependenciesCmd = installProjectDependencies(directory);
  const removeProjectTestsCmd = removeProjectTests(directory);
  
  console.log('Running tests. . .'.yellow);

  return Promise.resolve()
    .then(() => execAsync(installProjectDependenciesCmd))
    .then(() => report(testDirectory))
    .then((testResults) => {
      const { tests, passes, pending, failures } = testResults.stats;
        
      console.log(` Total tests:    ${tests}  `.bgBlack.white);
      console.log(` Passing tests:  ${passes}  `.bgBlue.white);
      console.log(` Pending tests:  ${pending}  `.bgYellow.black);
      console.log(` Failing tests:  ${failures}  `.bgRed.white);
  
      return { project, testResults };
    })
    .catch(error => execAsync(removeProjectTestsCmd)
      .then(() => Promise.reject(error)))
    .then(projectResults => execAsync(removeProjectTestsCmd)
      .then(() => projectResults));
}

module.exports.runTests = runTests;

function displayResults({ testResults }) {
  if (testResults.stats.failures > 0) {
    const { failures } = testResults;

    failures.forEach((currentTest, i) => {
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

    return { pass: false };
  } else {
    console.log('You did it! 100% complete, now please run'.green, 'os submit'.red);
    return { pass: true };
  }
}

module.exports.displayResults = displayResults;
