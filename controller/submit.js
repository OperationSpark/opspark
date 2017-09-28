'use strict';

var
  _ = require('lodash'),
  github = require('./github'),
  greenlight = require('./greenlight'),
  test = require('./test'),
  projects = require('./projects'),
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  exec = require('child_process').exec,
  rp = require('request-promise');

function submit(options) {
  test.test(options, true);
}

module.exports.submit = submit;

function checkGrade(project, stats) {
  if (stats.passes < (stats.tests / 2)) {
    console.log(`You have not passed all tests for ${project.name}! Must be have finished at least 50% to submit. Canceling submit.`.red);
  } else {
    console.log('Great! Beginning the upload process. . .'.green);
    createGist(project, stats);
  }
}

module.exports.checkGrade = checkGrade;

function createGist(project, stats) {
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

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      return console.log(err);
    }
    console.log('Gist created!'.green);
    ensureGistExists(project, JSON.parse(stdout), 1);
    // greenlight.grade(project, JSON.parse(stdout));
  });
}

module.exports.createGist = createGist;

function ensureGistExists(project, gist, tries) {
  if (tries < 4) {
    console.log('Ensuring gist exists. . .'.green, `Attempt ${tries}`.yellow);
    const url = gist.files['grade.txt'].raw_url;
    const cmd = `curl ${url}`;
    exec(cmd, function(err, stdout, stderr) {
      if (err) {
        return console.log(err);
      } else if (stdout === '404: Not Found') {
        ensureGistExists(project, gist, tries + 1);
      } else {
        greenlight.grade(project, gist);
      }
    });
  } else {
    console.log('There was an issue with your gist. Please try submitting again!'.red);
  }
}

function deleteGist(url) {
  const cmd = `curl -X DELETE -u ${github.grabLocalLogin()}:${github.grabLocalAuthToken()} ${url}`;

  console.log('Deleting gist. . .'.green);

  exec(cmd, function (err, stdout, stderr) {
    if (err) {
      return console.log(err);
    }
    console.log('Gist deleted!'.green);
  });
}

module.exports.deleteGist = deleteGist;
