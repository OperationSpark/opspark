'use strict';

require('colors');

const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log('Beginning install process!'.blue);
  projects.action = 'install';
  github.getCredentials()
    .then(greenlight.getSessions)
    .then(sessions.selectSession)
    .then(projects.selectProject)
    .then(projects.installProject)
    .then(projects.initializeProject)
    .then(res => console.log(`Successfully installed ${res.name}!`.blue))
    .catch(err => console.log(err));
};
