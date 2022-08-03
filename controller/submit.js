const clc = require('cli-color');
const exec = require('child_process').exec;

const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const sessions = require('./sessions');
const projects = require('./projects');
const test = require('./test');
const {
  createGistHelper,
  deleteGistHelper,
  readGistHelper
} = require('./helpers');

function submit() {
  console.log(clc.blue('Beginning submit process!'));
  projects.action = 'submit';
  github
    .getCredentials()
    .catch(janitor.error(clc.red('Failure getting credentials')))
    .then(greenlight.getGradable)
    .catch(janitor.error(clc.red('Failure getting sessions')))
    .then(sessions.selectSession)
    .catch(janitor.error(clc.red('Failure selecting session')))
    .then(projects.selectProject)
    .catch(janitor.error(clc.red('Failure selecting project')))
    .then(test.grabTests)
    .catch(janitor.error(clc.red('Failure grabbing tests')))
    .then(test.runTests)
    .catch(janitor.error(clc.red('Failure running tests')))
    .then(checkGrade)
    .catch(janitor.error(clc.red('Failure checking grade')))
    .then(createGist)
    .catch(janitor.error(clc.red('Failure creating gist')))
    .then(ensureGistExists)
    .catch(janitor.error(clc.red('Failure ensuring gist exists')))
    .then(greenlight.sendGrade)
    .catch(janitor.error(clc.red('Failure grading project')))
    .then(deleteGist)
    .catch(janitor.error(clc.red('Failure deleting gist')))
    .then(() => console.log(clc.blue('Successfully concluded submission.')))
    .catch(err => {
      console.error(err);
    });
}

module.exports.submit = submit;

function checkGrade({ project, testResults }) {
  const { stats } = testResults;
  return new Promise(function (res, rej) {
    if (stats.passes < stats.tests / 2) {
      rej(
        `You have not passed all tests for ${project.name}! Must be have finished at least 50% to submit. Canceling submit.`
          .red
      );
    } else {
      console.log(
        clc.green('Great!'),
        clc.yellow('Beginning the upload process. . .')
      );
      res({ project, stats });
    }
  });
}

module.exports.checkGrade = checkGrade;

function createGist({ project, stats }) {
  const files = {
    id: github.grabLocalUserID(),
    requirementId: project._id,
    sessionId: project._session,
    type: 'PROJECT',
    tests: stats.tests,
    passes: stats.passes,
    failures: stats.failures,
    grade: Math.round(100 * (stats.passes / stats.tests))
  };
console.log(files);
  let content = {
    public: true,
    description: 'Project results',
    files: {
      'grade.txt': {
        content: JSON.stringify(files)
      }
    }
  };

  content = JSON.stringify(content);
  return new Promise(function (res, rej) {
    console.log(clc.yellow('Creating gist. . .'));
    //issue with the command, saying that something was not found: Logan V
    const cmd = createGistHelper(
      github.grabLocalLogin(),
      github.grabLocalAuthToken(),
      content
    );
    exec(cmd, function (err, stdout, stderr) {
      const gist = JSON.parse(stdout);
      if (err) rej(err);
      console.log(clc.green('Gist created!'));
      res({ project, gist, tries: 1 });
    });
  });
}

module.exports.createGist = createGist;

function ensureGistExists({ project, gist, tries }) {
  return new Promise(function (res, rej) {
    if (tries < 4) {
      console.log(`Ensuring gist exists. . . Attempt ${tries}`.yellow);
      //this is the issue here gist is undefined, cmd.
      //need to rework command?
      //or an issue in github?
      const cmd = readGistHelper(gist.files['grade.txt'].raw_url);
      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          rej(err);
        } else if (stdout === '404: Not Found') {
          res(ensureGistExists({ project, gist, tries: tries + 1 }));
        } else {
          res({ project, gist });
        }
      });
    } else {
      rej('There was an issue with your gist. Please try submitting again!');
    }
  });
}

function deleteGist(url) {
  return new Promise(function (res, rej) {
    console.log(clc.yellow('Deleting gist. . .'));
    const cmd = deleteGistHelper(
      github.grabLocalLogin(),
      github.grabLocalAuthToken(),
      url
    );
    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        rej(err);
      }
      console.log(clc.green('Gist deleted!'));
      res(url);
    });
  });
}

module.exports.deleteGist = deleteGist;
