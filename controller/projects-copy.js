'use strict';

var
  _ = require('lodash'),
  fsJson = require('fs-json')(),
  changeCase = require('change-case'),
  async = require('async'),
  github = require('./github'),
  greenlight = require('./greenlight'),
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  fs = require('fs'),
  exec = require('child_process').exec,
  mkdirp = require('mkdirp'),
  rimraf = require('rimraf'),
  cancelOption = '[cancel]',
  env = require('./env'),
  rootDirectory = `${env.home()}/workspace`,
  projectEntriesPath = `${rootDirectory}/projects/projects.json`;

/**
 * INSTALL
 * Grabs all sessions a user is enrolled in
 * Creates list of all enrolled classes
 * User selects class to install project from
 * User selects project to install
 * Project is installed!
 */

const install = function () {
  if (!github.filesExist()) {
    console.log('We need some info, let\'s log into Github:'.green);
    github.obtainAuthorization(install);
  } else {
    chooseClass('install', function (session, action) {
      let projectsList = session.PROJECT;
      projectsList.push({
        name: 'Lets Get Functional',
      });
      projectsList = projectsList.sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });

      selectProject(projectsList, function (project) {
        installProject(project, null, function () {
          console.log('Have fun!!!'.green);
        });
      }, action);
    });
  }
};

module.exports.install = install;

const uninstall = function () {
  chooseClass('uninstall', function (session, action) {
    let projectsList = session.PROJECT;
    projectsList.push({
      name: 'Lets Get Functional',
    });
    projectsList = projectsList.sort(function (a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

    selectProject(projectsList, function (project) {
      uninstallProject(project, null, function () {
        console.log('Have fun!!!'.green);
      });
    }, action);
  });
};

module.exports.uninstall = uninstall;

const chooseClass = function (action, complete) {
  greenlight.getSessions(null, function (sessions) {
    greenlight.listEnrolledClasses(sessions, function (classes) {
      selectClass(classes, action, function (err, className) {
        const chosenClass = _.pickBy(sessions, obj => obj.name === className);
        let session = Object.keys(chosenClass)[0];
        session = chosenClass[session];
        complete(session, action);
      });
    });
  });
};

module.exports.chooseClass = chooseClass;

function selectClass(classes, action, complete) {
  async.waterfall([
    function (next) {
      inquirer.prompt([{
        type: 'list',
        name: 'class',
        message: `Select the class to ${action} a project from`,
        choices: classes.concat(cancelOption),
      }],
      function (response) {
        if (response.class === cancelOption) {
          console.log('Installation cancelled, bye bye!'.green);
          process.exit();
        }
        next(null, response);
      });
    },
    function (response, next) {
      inquirer.prompt([{
        type: 'confirm',
        name: 'install',
        message: `You selected ${response.class}: Is that correct?`,
        default: true
      }],
      function (confirm) {
        if (confirm.install) return complete(null, response.class);
        selectClass(classes, complete);
      });
    },
  ]);
}

module.exports.selectClass = selectClass;

function selectProject(projects, complete, action, flag) {
  async.waterfall([
    function (next) {
      inquirer.prompt([{
        type: 'list',
        name: 'project',
        message: `Select the project you wish to ${action}`,
        choices: _.map(projects, 'name').concat(cancelOption),
      }],
      function (response) {
        if (response.project === cancelOption) {
          console.log('Installation cancelled, bye bye!'.green);
          process.exit();
        }
        next(null, _.filter(projects, { name: response.project, })[0]);
      });
    },
    function (project, next) {
      inquirer.prompt([{
        type: 'confirm',
        name: 'install',
        message: `You selected ${project.name}: Go ahead and ${action}?`,
        default: true
      }],
      function (confirm) {
        if (confirm.install) return complete(project, flag);
        selectProject(projects, complete, action, flag);
      });
    },
  ]);
}
module.exports.selectProject = selectProject;

function installProject(project, pairedWith, complete) {
  const projectName = project.name.toLowerCase().replace(/\s/g, '-');
  const authToken = github.grabLocalToken();
  const projectsDirectory = `${rootDirectory}/projects`;
  if (!fs.existsSync(projectsDirectory)) mkdirp.sync(projectsDirectory);
  const projectDirectory = `${projectsDirectory}/${projectName}`;
  if (fs.existsSync(projectDirectory)) return console.log('Project %s already installed! Please delete manually before reinstalling, or install another project.'.red, projectName);

  console.log('Installing project %s, please wait...'.green, projectName);
  // TODO: change uri back to opspark github
  let uri = `https://github.com/livrush/${projectName}`;
  // let uri = `https://github.com/OperationSpark/${projectName}`;
  console.log('Cloning %s, please wait...'.green, uri);

  // TODO: change /branches/test to /trunk
  uri = `${uri}/branches/test --password ${authToken}`;
  // uri = `${uri}/trunk --password ${authToken}`;

  const cmd = `svn co ${uri} ${projectDirectory}`;
  exec(cmd, function (err) {
    if (err) return complete(err);
    console.log('Successfully cloned project!'.green);
    initializeProject(project, pairedWith, projectDirectory, complete);
  });
}
module.exports.installProject = installProject;

function uninstallProject(project, pairedWith, complete) {
  inquirer.prompt({
    type: 'confirm',
    name: 'delete',
    message: `Are you sure you want to delete ${project.name}? This cannot be undone.`.bgRed,
  }, function (confirm) {
    console.log(confirm);
  });
}
module.exports.uninstallProject = uninstallProject;

function initializeProject(project, pairedWith, projectDirectory, complete) {
  async.series(
    [
      // add revision number and remote //
      function (next) {
        removeGitRemnants(projectDirectory, next);
      },
      function (next) {
        removeSvnRemnants(projectDirectory, next);
      },
      function (next) {
        if (program.master) return next();
        removeMaster(projectDirectory, next);
      },
      function (next) {
        if (program.test) return next();
        removeTest(projectDirectory, next);
      },
      function (next) {
        installBower(projectDirectory, next);
      },
      function (next) {
        appendProjectEntry(project, pairedWith, next);
      },
    ],
    function (err, result) {
      if (err) return console.log(err + ''.red);
      console.log('Installation of project %s complete!'.blue, project.name);
      complete();
    }
  );
}
module.exports.initializeProject = initializeProject;

// TODO: 4. update the method appendProjectEntry to
// include the project's _id property.
// Update the check for already installed to search for this _id.
function appendProjectEntry(project, pairedWith, complete) {
  const projectEntries = loadOrCreateEntries();
  const e = _.filter(projectEntries.projects, { name: project.name })[0];
  if (e) {
    console.log('Project entry exists for %s, skipping entry...'.green, project.name);
    return complete();
  }
  const entry = {
    name: project.name,
    title: changeCase.titleCase(project.name),
    description: project.desc,
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', }),
  };
  if (pairedWith) entry.pairedWith = [pairedWith];
  projectEntries.projects.push(entry);
  fsJson.saveSync(projectEntriesPath, projectEntries);
  console.log('Project entry for %s saved!'.green, project.name);
  complete();
}
module.exports.appendProjectEntry = appendProjectEntry;

function installBower(projectDirectory, complete) {
  if (!fs.existsSync(`${projectDirectory}/bower.json`)) return complete();
  console.log('Installing bower components, please wait...'.green);
  exec(`cd ${projectDirectory} && bower install -F`, function (err, stdout) {
    if (err) throw err;
    console.log(stdout);
    console.log('Bower components installed for project %s!'.green, projectDirectory);
    complete();
  });
}
module.exports.installBower = installBower;

function removeGitRemnants(projectDirectory, complete) {
  const gitignore = `${projectDirectory}/.gitignore`;
  if (fs.existsSync(gitignore)) { fs.unlinkSync(gitignore); }
  rimraf(`${projectDirectory}/.git`, function (err) {
    if (err) return console.log(err);
    console.log('git remnants successfully removed from project %s'.green, projectDirectory);
    complete();
  });
}
module.exports.removeGitRemnants = removeGitRemnants;

function removeSvnRemnants(projectDirectory, complete) {
  rimraf(`${projectDirectory}/.svn`, function (err) {
    if (err) return console.log(err);
    console.log('svn remnants successfully removed from project %s'.green, projectDirectory);
    complete();
  });
}
module.exports.removeSvnRemnants = removeSvnRemnants;

function removeTest(projectDirectory, complete) {
  rimraf(`${projectDirectory}/test`, function (err) {
    if (err) return console.log(err);
    console.log('tests successfully removed from project %s'.green, projectDirectory);
    complete();
  });
}
module.exports.removeTest = removeTest;

function removeMaster(projectDirectory, complete) {
  rimraf(`${projectDirectory}/.master`, function (err) {
    if (err) return console.log(err);
    console.log('master successfully removed from project %s'.green, projectDirectory);
    complete();
  });
}
module.exports.removeMaster = removeMaster;

function loadOrCreateEntries() {
  return fsJson.loadSync(projectEntriesPath) || { projects: [] };
}
module.exports.loadOrCreateEntries = loadOrCreateEntries;
