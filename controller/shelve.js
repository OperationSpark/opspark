'use strict';

require('colors');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log('Beginning shelve process!'.blue);
  projects.action = 'shelve';
  github.getCredentials()
    .then(greenlight.getSessions)
    .then(sessions.selectSession)
    .then(projects.selectProject)
    .then(projects.shelveProject)
    .then(path => console.log('Project now available at'.blue, `${path}!`.yellow))
    .catch(err => console.log(err));
};
