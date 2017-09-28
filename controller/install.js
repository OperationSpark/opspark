const 
  github = require('./github'),
  greenlight = require('./greenlight'),
  projects = require('./projects'),
  sessions = require('./sessions'),
  test = require('../test'),
  colors = require('colors');

function install() {
  console.log('Beginning installation process!'.blue);
  projects.action = 'install';
  github.getCredentials()
    .then(greenlight.getSessions)
    .then(sessions.selectSession)
    .then(projects.selectProject)
    .then(projects.installProject)
    .then(projects.initializeProject)
    .then(res => console.log(`Successfully installed ${res.name}!`.blue))
    .catch(err => console.log(err));
}

module.exports.install = install;
