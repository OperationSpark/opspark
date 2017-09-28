'use strict';

require('colors');

const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log('Beginning uninstall process!'.blue);
  projects.action = 'uninstall';
  github.getCredentials()
    .then(greenlight.getSessions, janitor.error('Failure getting sessions'.red))
    .then(sessions.selectSession, janitor.error('Failure selecting session'.red))
    .then(projects.selectProject, janitor.error('Failure selecting project'.red))
    .then(projects.uninstallProject, janitor.error('Failure uninstalling project'.red))
    .then(res => console.log(`Successfully uninstalled ${res.name}!`.red))
    .catch(err => console.log(err));
};
