const clc = require('cli-color');
const fs = require('fs');
const changeCase = require('change-case');
const exec = require('child_process').exec;

const { home } = require('./env');
const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const sessions = require('./sessions');
const projects = require('./projects');
const report = require('./reporter');
const {
  downloadProjectTests,
  downloadProjectPackage,
  installProjectDependenciesCmd,
  removeProjectTestsCmd,
  execAsync
} = require('./helpers');

const rootDirectory = `${home()}/environment`;

// if (cloud9User) {
//   githubDir = fs
//     .readdirSync(rootDirectory)
//     .filter(dir => /[\w]+\.github\.io/.test(dir))[0];
//   rootDirectory = `${home()}/environment/${githubDir}`;
// } else if (codenvyUser) {
//   rootDirectory = codenvyUser;
//   githubDir = fs
//     .readdirSync(rootDirectory)
//     .filter(dir => /[\w]+\.github\.io/.test(dir))[0];
//   rootDirectory = `${rootDirectory}/${githubDir}`;
// }
const projectsDirectory = `${rootDirectory}/projects`;

// Start of test command
// Runs the listProjectsOf function from projects to select project
// that user wants to be tested
function test() {
  console.log(clc.blue('Beginning test process!'));
  projects.action = () => 'test';
  github
    .getCredentials()
    .catch(janitor.error(clc.red('Failure getting credentials')))
    .then(greenlight.getGradable)
    .catch(janitor.error(clc.red('Failure getting sessions')))
    .then(sessions.selectSession)
    .catch(janitor.error(clc.red('Failure selecting session')))
    .then(projects.selectProject)
    .catch(janitor.error(clc.red('Failure selecting project')))
    .then(grabTests)
    .catch(janitor.error(clc.red('Failure grabbing tests')))
    .then(runTests)
    .catch(janitor.error(clc.red('Failure running tests')))
    .then(displayResults)
    .catch(janitor.error(clc.red('Failure displaying results')))
    .then(() => console.log(clc.blue('Successfully concluded test.')))
    .catch(err => {
      console.error(err);
    });
}

module.exports.test = test;
/**
 * Runs svn export to download the tests for the specific project
 * and places them in the correct directory
 * Then calls setEnv
 * @param {*} project
 * @returns Promise<object>
 */
function grabTests(project) {
  return new Promise(function (res, rej) {
    const name = changeCase.paramCase(project.name);
    console.log(clc.yellow(`Downloading tests for ${name}. . .`));
    const directory = `${projectsDirectory}/${name}`;
    const cmd = downloadProjectTests(
      project.url,
      github.grabLocalAuthToken(),
      directory
    );
    const pckgCmd = downloadProjectPackage(
      project.url,
      github.grabLocalAuthToken(),
      directory
    );
    if (fs.existsSync(`${directory}/test`)) {
      console.log(clc.green('Skipping tests.'));
      res(project);
    } else {
      exec(cmd, function (error) {
        if (error) return rej(error);
        console.log(clc.green('Successfully downloaded tests!'));
        if (!fs.existsSync(`${directory}/package.json`)) {
          console.log(clc.yellow(`Downloading Package.json for ${name}. . .`));
          exec(pckgCmd, function () {
            console.log(clc.green('Package.json successfully installed'));
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

  const installProjectDependencies = () =>
    execAsync(installProjectDependenciesCmd(directory));
  const removeProjectTests = () => execAsync(removeProjectTestsCmd(directory));

  console.log(clc.yellow('Running tests. . .'));

  return Promise.resolve()
    .then(() => installProjectDependencies())
    .then(() => report(testDirectory))
    .then(testResults => {
      const { tests, passes, pending, failures } = testResults.stats;

      const getFillStr = n => {
        const chars = n.toString().length;
        const fillStr = new Array(5 - chars).fill(' ').join('');
        return `${n}${fillStr}`;
      };

      console.log(clc.bgBlue.white(`  Passing tests:  ${getFillStr(passes)}`));
      console.log(clc.bgRed.white(`  Failing tests:  ${getFillStr(failures)}`));
      console.log(
        clc.bgYellow.black(`  Pending tests:  ${getFillStr(pending)}`)
      );
      console.log(clc.bgBlack.white(`  Total tests:  ${getFillStr(tests)}`));

      return { project, testResults };
    })
    .then(
      testResults => removeProjectTests().then(() => testResults),
      error => removeProjectTests().then(() => Promise.reject(error))
    );
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
      console.log(clc.red.bold.underline(`${i + 1}) ${whichTest}`));
      console.log(clc.red(`> > > ${message}`));
      console.log(clc.xterm(252)(`> > > ${errorInfo}`));
      console.log(clc.xterm(252)(`> > > ${stackLineTwo}`));
    });

    // part divided by the whole 3/4 = 75%
    // use math.round to round to the nearest whole percent
    const grade = Math.round(
      100 * (testResults.stats.passes / testResults.stats.tests)
    );
    const clcMethod = grade > 75 ? clc.yellow : clc.red;
    console.log(clcMethod(`You have passed ${grade}% of the test.`));

    return { pass: false, grade };
  }

  console.log(
    clc.green('You did it! 100% complete, now please run'),
    clc.red('os submit')
  );
  return { pass: true, grade: 100 };
}

module.exports.displayResults = displayResults;
