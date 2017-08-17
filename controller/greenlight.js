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
  submit = require('./submit'),
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

function getSessions(auth, complete) {
  const options = {
    method: 'GET',
    // TODO: Switch URI for live version
    // uri: 'https://greenlight.operationspark.org/api/os/install',
    uri: 'http://localhost:3000/api/os/install',
    qs: {
      id: github.grabLocalID(),
    },
  };
  rp(options)
    .then(res => complete(JSON.parse(res)))
    .catch(err => console.error('upload failed:', err));
}

module.exports.getSessions = getSessions;

function listEnrolledClasses(classes, complete) {
  const names = _.map(classes, 'name');
  const cohorts = _.map(classes, 'cohort');
  const namesWithCohorts = _.map(classes, function (e) {
    return `${e.name}: ${e.cohort.split('-').slice(1).join(' ')}`;
  });
  if (complete) {
    complete(names);
  }
}

module.exports.listEnrolledClasses = listEnrolledClasses;

function get() {
  const options = {
    method: 'GET',
    // TODO: Switch URI for live version
    // uri: 'https://greenlight.operationspark.org/api/os/install',
    uri: 'http://localhost:3000/api/os/install',
    qs: {
      id: github.grabLocalID(),
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

function grade(project, gist) {
  console.log(gist.files);
  const body = {
    id: github.grabLocalID().toString(),
    requirementId: project._id,
    sessionId: project._session,
    url: gist.files['grade.txt'].raw_url,
  };
  const options = {
    method: 'POST',
    // TODO: Switch URI for live version
    // uri: 'https://greenlight.operationspark.org/api/os/grade',
    uri: 'http://localhost:3000/api/os/grade',
    body: body,
    json: true,
  };
  rp(options)
    .then(res => {
      if (res.status === 200) {
        console.log(res.message.blue);
      } else {
        console.log(res.reason.red);
        console.log(res.details.red);
      }
      submit.deleteGist(gist.url);
    })
    .catch(err => {
      console.error('upload failed:'.red, err);
      submit.deleteGist(gist.url);
    });
}

module.exports.grade = grade;
