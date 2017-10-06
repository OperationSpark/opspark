var
  config = require('../config').pair,
  _ = require('lodash'),
  util = require('util'),
  Q = require('q'),
  inquirer = require('inquirer'),
  cancelOption = '[cancel]',
  colors = require('colors'),
  view = require('../view'),
  github = require('./github'),
  projects = require('./projects'),
  _session;

// TODO : Promisify
module.exports.up = function (complete) {
  view.inquireForInput(config.msg.enterPartnerName,
    function (err, username) {
      if (err) return complete(err);
      github.user(username, function (err, user) {
        if (err) return complete(err);
        projects.list(function (err, list) {
          if (err) return console.log(err + ''.red);
          projects.selectProject(list, function (err, project) {
            if (err) return console.log(err + ''.red);
            projects.installProject(project, username, function () {
              console.log('You\'ve paired up with %s'.blue, username);
              complete(null);
            });
          });
        });
      });
    });
};

function down() {
  _session = {};
  return getUserForSession()
    .then(getPartnerName)
    .then(github.user)
    .then(function (user) {
      return user.login;
    }, onGitHubError)
    .then(projects.listProjectsOf)
    .then(listPartneredProjects)
    .then(projects.download)
    .then(function () {
      projects.appendProjectEntry(_session.pairedProject, _session.partnerName, function () {
        console.log('Sweet! The project you paired on with %s, %s, is now installed!'.green, _session.partnerName, _session.pairedProject.title);
      });
    })
    .fail(function (err) {
      if (err.message === 'GitHub user not found') {
        console.log(util.format('Hmm, we couldn\'t a GitHub user with the name %s!\nPlease check the spelling of your partner\'s GitHub username and try again.', _session.partnerName));
        return down();
      } else {
        throw err;
      }
    })
    .catch(function (err) {
      console.log(err.message.red)
    })
    .done();
}
module.exports.down = down;

function listPartneredProjects(projects) {
  var deferred = Q.defer();
  var pairedOnProjects = _.filter(projects, {
    'pairedWith': [_session.username]
  });

  inquirer.prompt([
    {
      type: "list",
      name: "project",
      message: "Select from the projects you paired on, the one you wish to install",
      choices: _.map(pairedOnProjects, 'title').concat(cancelOption)
    }],
    function (response) {
      if (response.project === cancelOption) {
        console.log('Installation cancelled, bye bye!'.green);
        process.exit();
      }
      var pairedProject = _.filter(pairedOnProjects, {
        'title': response.project
      })[0];
      _session.pairedProject = pairedProject;
      deferred.resolve(_session.partnerRepo + '/trunk/projects/' + pairedProject.name);
    });
  return deferred.promise;
}

function onGitHubError(err) {
  if (err.statusCode === 404) {
    throw new Error('GitHub user not found');
  }
}

function getUserForSession() {
  return github.getOrObtainUser()
    .then(function (user) {
      _session.username = user.login;
    });
}

function getPartnerName() {
  return view.promptForInput(config.msg.enterPartnerName)
    .then(function (partnerName) {
      _session.partnerName = partnerName;
      _session.partnerRepo = util.format('https://github.com/%s/%s.github.io', partnerName, partnerName);
      return partnerName;
    });
}