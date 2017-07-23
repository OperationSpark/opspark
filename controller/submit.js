'use strict';

var
  _ = require('lodash'),
  github = require('./github'),
  greenlight = require('./greenlight'),
  test = require('./test'),
  projects = require('./projects-copy'),
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  exec = require('child_process').exec,
  rp = require('request-promise');

function submit() {
  test.test(true);
}

module.exports.submit = submit;

function checkGrade(stats) {
  if (stats.tests !== stats.passes) {
    console.log('You have not passed all tests! Canceling submit.'.red);
  } else {
    console.log('Great! Beginning the upload process. . .'.green);
    createGist();
  }
}

module.exports.checkGrade = checkGrade;

function createGist(stats) {
  const cmd = `curl -X POST -d '{"public":true,"files":{"grade.txt":{"content":"heyheyhey"}}}' -u ${github.grabLocalLogin()}:${github.grabLocalToken()} https://api.github.com/gists`;

  console.log('Creating gist. . .'.green);

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
    console.log(JSON.parse(stdout).id);
    greenlight.submit(JSON.parse(stdout).id);
  });
}

module.exports.createGist = createGist;

function deleteGist(stats) {
  const id = '00259dbf78e7a5489bbe36e465d40ec6'

  const cmd = `curl -X DELETE -u ${github.grabLocalLogin()}:${github.grabLocalToken()} https://api.github.com/gists/${id}`

  console.log('Deleting gist. . .');

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
    console.log(stdout);
  });
}

module.exports.deleteGist = deleteGist;
