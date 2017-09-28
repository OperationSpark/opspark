#! /usr/bin/env node

'use strict';

var
  publish = require('./controller/publish'),
  config = require('./config.json'),
  init = require('./controller/init'),
  github = require('./controller/github'),
  greenlight = require('./controller/greenlight'),
  install = require('./controller/install'),
  shelve = require('./controller/shelve'),
  uninstall = require('./controller/uninstall'),
  npm = require('./controller/npm'),
  projects = require('./controller/projects'),
  test = require('./controller/test'),
  submit = require('./controller/submit'),
  janitor = require('./controller/janitor'),
  pair = require('./controller/pair'),
  handshake = require('./controller/handshake'),
  appRoot = require('app-root-path'),
  program = require('commander');

program
  .version('2.2.4');

program
  .command('login')
  .description('Sets up authorizations for github.')
  .action(init.login);

program
  .command('init-hs')
  .description('Connect workspace with Greenlight to provide the neccessary projects for whichever class the student is taking.')
  .action(handshake);

program
  .command('init-pf')
  .description('Initialize your portfolio.html with the JavaScript necessary to dynamically add portfolio projects as list items to the unordered-list with the id of portfolio.')
  .action(initPortfolio);

program
  .command('init-ws')
  .description('To get up and running quickly, installs a completed version of the index.html and portfolio.html files of the Operation Spark website project.')
  .action(init.website);

program
  .option("-t, --test", "Keep test files")
  .option("-m, --master", "Keep master files")
  .command("install")
  .description("List installable projects.")
  .action(install);

program
  .command('shelve')
  .description('Save previous work in a project in order to begin anew.')
  .action(shelve);

program
  .command('uninstall')
  .description('Remove an installed project.')
  .action(uninstall);

program
  .option('-m, --master', 'Keep master files')
  .command('pairup')
  .description('Installs a project for pair programming. The workspace owner will be asked to provide the GitHub username of their partner.')
  .action(pairup);

program
  .command('pairdown')
  .description('Downloads and installs a project from the GitHub Pages repository of the student with whom the using student paired. Will fail if project is already installed.')
  .action(pairdown);

program
  .command('npm')
  .description('Selects a project to install npm packages to, then specifies whether one or all packages should be installed.')
  .action(npm.install);

program
  .command('start')
  .description('Runs npm start script of selected project.')
  .action(npm.start);

program
  .command('test')
  .description('Downloads tests for selected project and presents student with current results.')
  .action(test.test);

program
  .command('submit')
  .description('Submits test results to Greenlight as student\'s grade.')
  .action(submit.submit);

program
  .command('logout')
  .description('Will clear any local authorizations from the user\'s workspace. The user will be asked to authorize next time they trip the need.')
  .action(github.deauthorizeUser);

program
  .command('fix')
  .description('Reads the projects directory, reconciles the installed projects with the projects.json file, and removes any git or svn cruft from installed projects.')
  .action(fix);

program
  .command('publish [message]')
  .description('Pushes all branches to the users GitHub pages repository at <username>.github.io by serially invoking:\ngit add -A\ngit commit -m"update website"\ngit push"\nOptional commit message defaults to "update website".')
  .action(function (message) {
    message = message ? message : 'update website';
    publish.all(message)
      .then(function (result) {
        console.log(result);
      });
  });

program.parse(process.argv);

// TODO : move to pair.js and call directly //
function pairup() {
  pair.up(function (err) {
    if (err) console.log(err);
  });
}

// TODO : move to pair.js and call directly //
function pairdown() {
  pair.down(function (err) {
    if (err) console.log(err);
  });
}

function initPortfolio() {
  init.portfolio();
}

function fix() {
  janitor.fix(function (err) {
    if (err) console.log(err);
  });
}
