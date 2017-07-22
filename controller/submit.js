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
  test = require('./test'),
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

function submit() {
  test.test(true);
}

module.exports.submit = submit;

function checkGrade(stats) {
  if (stats.tests !== stats.passes) {
    console.log('You have not passed all tests! Canceling submit.'.red)
  } else {
    console.log(stats);
  }
}
