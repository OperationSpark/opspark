const clc = require('cli-color');
const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log(clc.blue('Beginning uninstall process!'));
  projects.action = 'uninstall';
  github
    .getCredentials()
    .catch(janitor.error(clc.red('Failure getting credentials')))
    .then(greenlight.getSessions)
    .catch(janitor.error(clc.red('Failure getting sessions')))
    .then(sessions.selectSession)
    .catch(janitor.error(clc.red('Failure selecting session')))
    .then(projects.selectProject)
    .catch(janitor.error(clc.red('Failure selecting project')))
    .then(projects.uninstallProject)
    .catch(janitor.error(clc.red('Failure uninstalling project')))
    .then(res => console.log(clc.red(`Successfully uninstalled ${res.name}!`)))
    .catch(err => console.log(err));
};
