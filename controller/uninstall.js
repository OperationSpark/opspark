require('../lib/colours');
const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log('Beginning uninstall process!'.blue());
  projects.action = 'uninstall';
  github.getCredentials()
    .catch(janitor.error('Failure getting credentials'.red()))
    .then(greenlight.getSessions)
    .catch(janitor.error('Failure getting sessions'.red()))
    .then(sessions.selectSession)
    .catch(janitor.error('Failure selecting session'.red()))
    .then(projects.selectProject)
    .catch(janitor.error('Failure selecting project'.red()))
    .then(projects.uninstallProject)
    .catch(janitor.error('Failure uninstalling project'.red()))
    .then(res => console.log(`Successfully uninstalled ${res.name}!`.red))
    .catch(err => console.log(err));
};
