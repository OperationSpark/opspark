require('colors');
const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log('Beginning shelve process!'.blue);
  projects.action = 'shelve';
  github.getCredentials()
    .catch(janitor.error('Failure getting credentials'.red))
    .then(greenlight.getSessions)
    .catch(janitor.error('Failure getting sessions'.red))
    .then(sessions.selectSession)
    .catch(janitor.error('Failure selecting session'.red))
    .then(projects.selectProject)
    .catch(janitor.error('Failure selecting project'.red))
    .then(projects.shelveProject)
    .catch(janitor.error('Failure shelving project'.red))
    .then(path => console.log('Project now available at'.blue, `${path}!`.yellow))
    .catch((err) => { console.error(err); });
};
