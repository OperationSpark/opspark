const 
  github = require('./github'),
  greenlight = require('./greenlight'),
  projects = require('./projects'),
  sessions = require('./sessions'),
  colors = require('colors');

module.exports = function () {
  console.log('Beginning uninstall process!'.blue);
  projects.action = 'uninstall';
  github.getCredentials()
    .then(greenlight.getSessions)
    .then(sessions.selectSession)
    .then(projects.selectProject)
    .then(projects.uninstallProject)
    .then(res => console.log(`Successfully uninstalled ${res.name}!`.red))
    .catch(err => console.log(err));
}
