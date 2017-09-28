'use strict';

var
  _ = require('lodash'),
  github = require('./github'),
  greenlight = require('./greenlight'),
  sessions = require('./sessions'),
  projects = require('./projects'),
  test = require('./test'),
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  exec = require('child_process').exec,
  rp = require('request-promise');

function submit() {
  console.log('Beginning submit process!'.blue);
  projects.action = 'submit';
  github.getCredentials()
    .then(greenlight.getSessions)
    .then(sessions.selectSession)
    .then(projects.selectProject)
    .then(test.grabTests)
    .then(test.runTests)
    .then(checkGrade)
    .then(createGist)
    .then(ensureGistExists)
    .then(greenlight.grade)
    .then(deleteGist)
    .then(() => console.log('Successfully concluded submission.'.blue))
    .catch(err => console.log(err));
}

module.exports.submit = submit;

function checkGrade({ project, parsedStdout }) {
  const stats = parsedStdout.stats;
  return new Promise(function (res, rej) {
    if (stats.passes < (stats.tests / 2)) {
      rej(`You have not passed all tests for ${project.name}! Must be have finished at least 50% to submit. Canceling submit.`.red);
    } else {
      console.log('Great! Beginning the upload process. . .'.green);
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
  };

  const content = {
    public: true,
    description: 'Project results',
    files: {
      'grade.txt': {
        content: JSON.stringify(files),
      }
    }
  };

  const cmd = `curl -X POST -d '${JSON.stringify(content)}' -u ${github.grabLocalLogin()}:${github.grabLocalAuthToken()} https://api.github.com/gists`;

  console.log('Creating gist. . .'.green);

  return new Promise(function(res, rej) {
    exec(cmd, function (err, stdout, stderr) {
      const gist = JSON.parse(stdout);
      if (err) rej(err);
      console.log('Gist created!'.green);
      res({ project, gist, tries: 1 });
    });
  });
}

module.exports.createGist = createGist;

function ensureGistExists({ project, gist, tries }) {
  return new Promise(function(res, rej) {
    if (tries < 4) {
      console.log('Ensuring gist exists. . .'.green, `Attempt ${tries}`.yellow);
      const url = gist.files['grade.txt'].raw_url;
      const cmd = `curl ${url}`;
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
    const cmd = `curl -X DELETE -u ${github.grabLocalLogin()}:${github.grabLocalAuthToken()} ${url}`;
    console.log('Deleting gist. . .'.green);
    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        rej(err);
      }
      console.log('Gist deleted!'.green);
      res();
    });
  });
}

module.exports.deleteGist = deleteGist;
