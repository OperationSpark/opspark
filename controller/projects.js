const clc = require('cli-color');
const fs = require('fs');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const fsJson = require('fs-json')();
const program = require('commander');
const prompt = require('inquirer').prompt;
const changeCase = require('change-case');
const exec = require('child_process').exec;
const { waterfall, series } = require('async');

const { home, cloud9User, codenvyUser } = require('./env');
const github = require('./github');
const { downloadProject } = require('./helpers');

let rootDirectory = `${home()}/environment`;
let githubDir;

if (cloud9User) {
  githubDir = fs
    .readdirSync(`${rootDirectory}`)
    .filter(dir => /[\w]+\.github\.io/.test(dir))[0];
  rootDirectory = `${home()}/environment/${githubDir}`;
} else if (codenvyUser) {
  rootDirectory = codenvyUser;
  githubDir = fs
    .readdirSync(`${rootDirectory}/`)
    .filter(dir => /[\w]+\.github\.io/.test(dir))[0];
  rootDirectory = `${rootDirectory}/${githubDir}`;
}

const projectEntriesPath = `${rootDirectory}/projects/projects.json`;
const projectsDirectory = `${rootDirectory}/projects`;
const cancelOption = '[cancel]';

let action = null;

module.exports.action = () => action;

function selectProject({ session, projectAction }) {
  action = projectAction;
  const projects = listProjects(session, action);
  return new Promise(function (res) {
    waterfall([
      function (next) {
        prompt(
          [
            {
              type: 'list',
              name: 'project',
              message: `Select the project you wish to ${action}`,
              choices: _.map(projects, 'name').concat(cancelOption)
            }
          ],
          function (response) {
            if (response.project === cancelOption) {
              console.log(`${action} cancelled, bye bye!`.green);
              process.exitCode = 0;
              process.exit();
            }
            next(null, _.filter(projects, { name: response.project })[0]);
          }
        );
      },
      function (project, next) {
        prompt(
          [
            {
              type: 'confirm',
              name: 'install',
              message: `You selected ${project.name}: Go ahead and ${action}?`,
              default: true
            }
          ],
          function (confirm) {
            if (confirm.install) return res(project);
            return res(selectProject({ session, projectAction }));
          }
        );
      }
    ]);
  });
}
module.exports.selectProject = selectProject;

function listProjects(session, listAction) {
  console.log(clc.yellow('Grabbing projects. . .'));
  const projects = session.PROJECT;
  let files;
  let testableProjects;
  const mappedProjects = _.map(projects, function (project) {
    return changeCase.paramCase(project.name);
  });
  if (fs.existsSync(projectsDirectory)) {
    files = fs.readdirSync(projectsDirectory);
  } else {
    files = [];
  }
  if (listAction === 'install') {
    testableProjects = _.difference(mappedProjects, files);
  } else {
    testableProjects = mappedProjects;
  }
  return projects
    .reduce(function (seed, project) {
      if (testableProjects.indexOf(changeCase.paramCase(project.name)) > -1) {
        const updatedProject = project;
        updatedProject._session = session.sessionId;
        seed.push(updatedProject);
      }
      return seed;
    }, [])
    .sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
}

module.exports.listProjects = listProjects;

function installProject(project) {
  return new Promise(function (res, rej) {
    ensureProjectsDirectory();
    const projectName = changeCase.paramCase(project.name);
    const projectDirectory = `${projectsDirectory}/${projectName}`;
    if (ensureProjectDirectory(projectDirectory)) {
      rej(`${project.name} already installed!`.red);
    }
    console.log(
      clc.yellow('Installing project %s, please wait...'),
      projectName
    );
    const cmd = downloadProject(
      project.url,
      github.grabLocalAuthToken(),
      projectDirectory
    );
    exec(cmd, function (err) {
      if (err) return rej(err);
      res(project);
    });
  });
}

module.exports.installProject = installProject;

function uninstallProject(project) {
  return new Promise(function (res, rej) {
    prompt(
      {
        type: 'confirm',
        name: 'delete',
        message:
          `Are you sure you want to delete ${project.name}? This cannot be undone.`
            .bgRed
      },
      function (confirm) {
        if (confirm.delete) {
          const name = changeCase.paramCase(project.name);
          const projectDirectory = `${rootDirectory}/projects/${name}`;
          removeProjectEntry(project);
          console.log(clc.red('Removing project directory. . .'));
          exec(`rm -rf ${projectDirectory}`, function () {
            res(project);
          });
        } else {
          rej('Delete aborted');
        }
      }
    );
  });
}
module.exports.uninstallProject = uninstallProject;

function shelveProject(project) {
  console.log(clc.yellow('Fetching directory. . .'));
  return new Promise(function (res, rej) {
    removeProjectEntry(project);
    const name = changeCase.paramCase(project.name);
    const path = `${rootDirectory}/projects`;
    const underscores = fs.readdirSync(path).reduce((s, c) => {
      if (c.indexOf(name) > -1) {
        const u = c.replace(/(_)|[^]/g, '$1');
        return u.length > s.length ? u : s;
      }
      return s;
    }, '');
    const cmd = `mv ${path}/${name} ${path}/${underscores}_${name}`;
    console.log(clc.yellow('Shelving project. . .'));
    exec(cmd, function () {
      res(`${path}/${underscores}_${name}`);
    });
  });
}

module.exports.shelveProject = shelveProject;

function initializeProject(project) {
  const projectName = changeCase.paramCase(project.name);
  const projectDirectory = `${projectsDirectory}/${projectName}`;
  console.log(clc.yellow('Initializing project. . .'));
  return new Promise(function (res, rej) {
    series(
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
          appendProjectEntry(project, null, next);
        }
      ],
      function (err, result) {
        if (err) rej(err);
        res(project);
      }
    );
  });
}
module.exports.initializeProject = initializeProject;

// TODO: 4. update the method appendProjectEntry to
// include the project's _id property.
// Update the check for already installed to search for this _id.
function appendProjectEntry(project, pairedWith, complete) {
  const projectEntries = loadOrCreateEntries();
  const e = _.filter(projectEntries.projects, { name: project.name })[0];
  if (e) {
    console.log(
      clc.green('Project entry exists for %s, skipping entry...'),
      project.name
    );
    return complete();
  }
  const entry = {
    name: changeCase.paramCase(project.name),
    title: changeCase.titleCase(project.name),
    description: project.desc,
    date: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
  if (pairedWith) entry.pairedWith = [pairedWith];
  projectEntries.projects.push(entry);
  fsJson.saveSync(projectEntriesPath, projectEntries);
  console.log(clc.green('Project entry for %s saved!'), project.name);
  complete();
}
module.exports.appendProjectEntry = appendProjectEntry;

function removeProjectEntry(project) {
  console.log(clc.red('Removing entry from projects.json. . .'));
  const projectEntries = loadOrCreateEntries();
  const index = projectEntries.projects.reduce(function (s, p, i) {
    if (p.name === project.name) {
      return i;
    }
    return s;
  }, -1);
  projectEntries.projects.splice(index, 1);
  fsJson.saveSync(projectEntriesPath, projectEntries);
  console.log(clc.red('Successfully removed!'));
}

module.exports.removeProjectEntry = removeProjectEntry;

function installBower(projectDirectory, complete) {
  if (!fs.existsSync(`${projectDirectory}/bower.json`)) return complete();
  console.log(clc.green('Installing bower components, please wait...'));
  exec(`cd ${projectDirectory} && bower install -F`, function (err, stdout) {
    if (err) throw err;
    console.log(
      clc.green('Bower components installed for project %s!'),
      projectDirectory
    );
    complete();
  });
}
module.exports.installBower = installBower;

function removeGitRemnants(projectDirectory, complete) {
  const gitignore = `${projectDirectory}/.gitignore`;
  if (fs.existsSync(gitignore)) {
    fs.unlinkSync(gitignore);
  }
  rimraf(`${projectDirectory}/.git`, function (err) {
    if (err) return console.log(err);
    console.log(
      clc.green('git remnants successfully removed from project %s'),
      projectDirectory
    );
    complete();
  });
}
module.exports.removeGitRemnants = removeGitRemnants;

function removeSvnRemnants(projectDirectory, complete) {
  rimraf(`${projectDirectory}/.svn`, function (err) {
    if (err) return console.log(err);
    console.log(
      clc.green('svn remnants successfully removed from project %s'),
      projectDirectory
    );
    complete();
  });
}
module.exports.removeSvnRemnants = removeSvnRemnants;

function removeTest(projectDirectory, complete) {
  rimraf(`${projectDirectory}/test`, function (err) {
    if (err) return console.log(err);
    console.log(
      clc.green('tests successfully removed from project %s'),
      projectDirectory
    );
    complete();
  });
}
module.exports.removeTest = removeTest;

function removeMaster(projectDirectory, complete) {
  rimraf(`${projectDirectory}/.master`, function (err) {
    if (err) return console.log(err);
    console.log(
      clc.green('master successfully removed from project %s'),
      projectDirectory
    );
    complete();
  });
}
module.exports.removeMaster = removeMaster;

function loadOrCreateEntries() {
  return fsJson.loadSync(projectEntriesPath) || { projects: [] };
}

module.exports.loadOrCreateEntries = loadOrCreateEntries;

function ensureProjectsDirectory() {
  if (!fs.existsSync(projectsDirectory)) mkdirp.sync(projectsDirectory);
}

module.exports.ensureProjectsDirectory = ensureProjectsDirectory;

function ensureProjectDirectory(projectDirectory) {
  return fs.existsSync(projectDirectory);
}

module.exports.ensureProjectDirectory = ensureProjectDirectory;
