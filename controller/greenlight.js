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
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  fs = require('fs'),
  url = require('url'),
  exec = require('child_process').exec,
  request = require('request'),
  rp = require('request-promise'),
  mkdirp = require('mkdirp'),
  rimraf = require('rimraf'),
  cancelOption = '[cancel]',
  env = require('./env'),
  rootDirectory = `${env.home()}/workspace`,
  projectEntriesPath = `${rootDirectory}/projects/projects.json`;

function getProjects(auth, complete) {
  const options = {
    method: 'GET',
    // TODO: Switch URI for live version
    // uri: 'https://greenlight.operationspark.org/api/os/install',
    uri: `http://localhost:3000/api/os/install`,
    qs: {
      id: github.grabLocalToken(),
    },
    headers: {
      authorization: 'cb829798-b86e-496a-b311-6b37628e8116',
    },
  };
  rp(options)
    .then(res => complete(JSON.parse(res)))
    .catch(err => console.error('upload failed:', err));
}

module.exports.getProjects = getProjects;

function listEnrolledClasses(classes, complete) {
  console.log(classes);
  complete(_.map(classes, 'name'));
}

module.exports.listEnrolledClasses = listEnrolledClasses;

function get() {
  const options = {
    method: 'GET',
    // TODO: Switch URI for live version
    // uri: 'https://greenlight.operationspark.org/api/os/install',
    uri: `http://localhost:3000/api/os/install`,
    qs: {
      id: github.grabLocalToken(),
    },
    headers: {
      authorization: 'cb829798-b86e-496a-b311-6b37628e8116',
    },
  };
  rp(options)
    .then(res => {
      console.log(res);
      const r = JSON.parse(res);
      var x = _.map(r, 'name');
      console.log(x);
    })
    .catch(err => console.error('upload failed:', err));
}

module.exports.get = get;
