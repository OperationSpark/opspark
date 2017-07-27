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
  greenlight = require('./greenlight'),
  projects = require('./projects-copy'),
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
  projectsDirectory = `${rootDirectory}/projects`;

/**
 * INSTALL
 * Grabs all sessions a user is enrolled in
 * Creates list of all enrolled classes
 * User selects class to install project from
 * User selects project to install
 * Project is installed!
 */

module.exports.install = function () {
  greenlight.getSessions(null, function (sessions) {
    greenlight.listEnrolledClasses(sessions, function (classes) {
      projects.selectClass(classes, 'install', function (err, className) {
        const chosenClass = _.pickBy(sessions, obj => obj.name === className);
        const session = Object.keys(chosenClass)[0];
        const projectsList = chosenClass[session].PROJECT;
        projects.selectProject(projectsList, function (err, project) {
          if (err) return console.log(err + ''.red);
          getPackageName(project);
        }, 'install');
      });
    });
  });
};

const getPackageName = function (project) {
  inquirer.prompt([{
    type: 'input',
    name: 'name',
    message: `What package would you like to install in ${project.name}?`,
  }], function (response) {
    confirmPackage(project, response);
  });
};

const confirmPackage = function (project, pkg) {
  if (pkg.name === '') {
    inquirer.prompt([{
      type: 'confirm',
      name: 'install',
      message: `Install all packages in ${project.name}?`,
      default: true
    }], function (response) {
      if (response.install) return installPackages(true, project);
      getPackageName(project);
    });
  } else {
    inquirer.prompt([{
      type: 'confirm',
      name: 'install',
      message: `Install ${pkg.name} in ${project.name}?`,
      default: true
    }], function (response) {
      if (response.install) return installPackages(false, project, pkg);
      getPackageName(project);
    });
  }
};

const installPackages = function (all, project, pkg) {
  let installCmd;
  const name = changeCase.paramCase(project.name);
  const enterDirectory = `cd ${projectsDirectory}/${name}/`;
  if (all) {
    installCmd = 'npm install';
  } else {
    installCmd = `npm install --save ${pkg.name}`;
  }
  const cmd = `${enterDirectory} && ${installCmd}`;
  exec(cmd, function (err, stdout, stderr) {
    if (err) return console.log('error:'.red, err);
    console.log('Successfully installed'.green);
  });
};
