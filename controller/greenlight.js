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

// TODO: Switch URI for live version
const LOCALHOST = 'http://localhost:3000';
const GREENLIGHT = 'https://greenlight.operationspark.org';
const URI = GREENLIGHT;

module.exports.URI = URI;

function getSessions({ id }) {
  console.log('Grabbing enrolled sessions. . .'.yellow)
  const options = {
    method: 'GET',
    uri: `${URI}/api/os/install`,
    qs: {
      id,
    },
  };
  return rp(options);
}

module.exports.getSessions = getSessions;

function grade({ project, gist }) {
  const body = {
    id: github.grabLocalUserID().toString(),
    requirementId: project._id,
    sessionId: project._session,
    url: gist.files['grade.txt'].raw_url,
  };

  const options = {
    body,
    method: 'POST',
    uri: `${URI}/api/os/grade`,
    json: true,
  };

  return new Promise(function (res, rej) {
    rp(options)
      .then((response) => {
        if (response.status === 200) {
          console.log(response.message.blue);
        } else {
          console.log(response.reason.red);
          console.log(response.details.red);
        }
        res(gist.url);
      })
      .catch((err) => {
        rej(err);
        res(gist.url);
      });
  });
}

module.exports.grade = grade;
