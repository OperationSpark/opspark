const clc = require('cli-color');
const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log(clc.blue('Beginning shelve process!'));
  projects.action = 'shelve';
  github
    .getCredentials()
    .catch(janitor.error(clc.red('Failure getting credentials')))
    .then(greenlight.getSessions)
    .catch(janitor.error(clc.red('Failure getting sessions')))
    .then(sessions.selectSession)
    .catch(janitor.error(clc.red('Failure selecting session')))
    .then(projects.selectProject)
    .catch(janitor.error(clc.red('Failure selecting project')))
    .then(projects.shelveProject)
    .catch(janitor.error(clc.red('Failure shelving project')))
    .then(path =>
      console.log(clc.blue('Project now available at'), clc.yellow(`${path}!`))
    )
    .catch(err => {
      console.error(err);
    });
};
