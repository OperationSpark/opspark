'use strict';

require('colors');

const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

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
};
