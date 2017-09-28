'use strict';

require('colors');

const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const projects = require('./projects');
const sessions = require('./sessions');

module.exports = function () {
  console.log('Beginning install process!'.blue);
  projects.action = 'install';
  github.getCredentials()
    .then(greenlight.getSessions, janitor.error('Failure getting sessions'.red))
    .then(sessions.selectSession, janitor.error('Failure selecting session'.red))
    .then(projects.selectProject, janitor.error('Failure selecting project'.red))
    .then(projects.installProject, janitor.error('Failure installing project'.red))
    .then(projects.initializeProject, janitor.error('Failure initializing'.red))
    .then(res => console.log(`Successfully installed ${res.name}!`.blue))
    .catch((err) => { throw new Error(err); });
};
