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
  projects = require('./projects-copy'),
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  fs = require('fs'),
  url = require('url'),
  exec = require('child_process').exec,
  request = require('request'),
  mkdirp = require('mkdirp'),
  rimraf = require('rimraf'),
  cancelOption = '[cancel]',
  rootDirectory = './',
  projectEntriesPath = 'projects/projects.json';

module.exports.test = function() {
  const username = github.grabLocalLogin();
  console.log(username);
  const installedProjects = projects.listProjectsOf(username);
  console.log(installedProjects);
  projects.selectProject(installedProjects, null, 'test');
};

module.exports.test();
