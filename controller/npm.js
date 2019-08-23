const _ = require('lodash');
const fs = require('fs');
const inquirer = require('inquirer');
const changeCase = require('change-case');
const exec = require('child_process').exec;

const { home, cloud9User, codenvyUser } = require('./env');
const greenlight = require('./greenlight');
const projects = require('./projects');

let rootDirectory = `${home()}/environment`;
let githubDir;
if (cloud9User) {
  // if on cloud9, use project root at environment to get github repo
  githubDir = fs.readdirSync(`${rootDirectory}`)
    .filter(dir => /[\w]+\.github\.io/.test(dir))[0];
  rootDirectory = `${rootDirectory}/${githubDir}`;
} else if (codenvyUser) {
  // else if on codenvy, look for github repo on root from app env
  rootDirectory = codenvyUser;
  githubDir = fs.readdirSync(`${rootDirectory}`)
    .filter(dir => /[\w]+\.github\.io/.test(dir))[0];
  rootDirectory = `${rootDirectory}/${githubDir}`;
}

const projectsDirectory = `${rootDirectory}/projects`;

/**
 * INSTALL
 * Grabs all sessions a user is enrolled in
 * Creates list of all enrolled classes
 * User selects class to install project from
 * User selects project to install
 * Project is installed!
 */

const chooseProject = function (action, complete) {
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
  projects.chooseClass('install package to', function (session, action) {
    let projectsList = session.PROJECT;
    projectsList.push({
      name: 'Lets Get Functional',
    })
    projectsList = projectsList.sort(function(a, b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    });

    projects.selectProject(projectsList, getPackageName, action);
  });
};

// Run npm start script in specific project
module.exports.start = function () {
  projects.chooseClass('install package to', function (session, action) {
    let projectsList = session.PROJECT;
    projectsList.push({
      name: 'Lets Get Functional',
    })
    projectsList = projectsList.sort(function(a, b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    });

    projects.selectProject(projectsList, startProject, action);
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
    console.log('Going going going. . .'.yellow);
  });
};
