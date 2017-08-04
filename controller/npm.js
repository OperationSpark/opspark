'use strict';

const _ = require('lodash');
const changeCase = require('change-case');
const greenlight = require('./greenlight');
const projects = require('./projects-copy');
const inquirer = require('inquirer');
const exec = require('child_process').exec;
const env = require('./env');

const rootDirectory = `${env.home()}/workspace`;
const projectsDirectory = `${rootDirectory}/projects`;

/**
 * INSTALL
 * Grabs all sessions a user is enrolled in
 * Creates list of all enrolled classes
 * User selects class to install project from
 * User selects project to install
 * Project is installed!
 */

const chooseProject = function(action, complete) {
  greenlight.getSessions(null, function (sessions) {
    greenlight.listEnrolledClasses(sessions, function (classes) {
      projects.selectClass(classes, action, function (err, className) {
        const chosenClass = _.pickBy(sessions, obj => obj.name === className);
        const session = Object.keys(chosenClass)[0];
        const projectsList = chosenClass[session].PROJECT;
        projectsList.push({
          name: 'Lets Get Functional',
        })
        projects.selectProject(projectsList, complete, action);
      });
    });
  });
}

// Install all or one npm package to a specific project
module.exports.install = function () {
  chooseProject('install', getPackageName);
};

// Run npm start script in specific project
module.exports.start = function () {
  chooseProject('start', startProject);
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
  exec(cmd, function (err) {
    if (err) return console.log('error:'.red, err);
    console.log('Successfully installed'.green);
  });
};

const startProject = function (project) {
  const name = changeCase.paramCase(project.name);
  const enterDirectory = `cd ${projectsDirectory}/${name}/`;
  const cmd = `${enterDirectory} && npm start`;
  exec(cmd, function (err) {
    if (err) return console.log('error:'.red, err);
    console.log('Going going going. . .'.green);
  });
};
