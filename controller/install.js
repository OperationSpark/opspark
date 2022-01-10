require('colors');

const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log('Beginning install process!'.blue());
  projects.action = 'install';
  github.getCredentials()
    .catch(janitor.error('Incorrect credentials'.red()))
    .then(greenlight.getSessions)
    .catch(janitor.error('Failure getting sessions'.red()))
    .then(sessions.selectSession)
    .catch(janitor.error('Failure selecting session'.red()))
    .then(projects.selectProject)
    .catch(janitor.error('Failure selecting project'.red()))
    .then(projects.installProject)
    .catch(janitor.error('Failure installing project'.red()))
    .then(projects.initializeProject)
    .catch(janitor.error('Failure initializing'.red()))
    .then(res => console.log(`Successfully installed ${res.name}!`.blue))
    .catch((err) => { console.error(err); });
};
