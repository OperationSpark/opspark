const clc = require('cli-color');

const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log(clc.blue('Beginning install process!'));
  projects.action = 'install';
  github
    .getCredentials()
    .catch(janitor.error(clc.red('Incorrect credentials')))
    .then(greenlight.getSessions)
    .catch(janitor.error(clc.red('Failure getting sessions')))
    .then(sessions.selectSession)
    .catch(janitor.error(clc.red('Failure selecting session')))
    .then(projects.selectProject)
    .catch(janitor.error(clc.red('Failure selecting project')))
    .then(projects.installProject)
    .catch(janitor.error(clc.red('Failure installing project')))
    .then(projects.initializeProject)
    .catch(janitor.error(clc.red('Failure initializing')))
    .then(res => console.log(clc.blue(`Successfully installed ${res.name}!`)))
    .catch(err => {
      console.error(err);
    });
};
