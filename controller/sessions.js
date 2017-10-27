require('colors');
const _ = require('lodash');
const inquirer = require('inquirer');
const { waterfall } = require('async');
const changeCase = require('change-case');

const projects = require('./projects');

const cancelOption = '[cancel]';

function pluckSession(title, sessions) {
  const sessionsArray = _.map(sessions, session => session);
  return sessionsArray.reduce(function (result, current) {
    return current.title === title ? current : result;
  }, null);
}

module.exports.pluckSession = pluckSession;

function selectSession(sessions) {
  const parsedSessions = JSON.parse(sessions);
  const sessionNames = _.map(parsedSessions, session => session.title);
  return new Promise(function (res, rej) {
    waterfall([
      function (next) {
        inquirer.prompt(
          [
            {
              type: 'list',
              name: 'class',
              message: `Select the class to ${projects.action} a project from`,
              choices: sessionNames.concat(cancelOption)
            }
          ],
          function (response) {
            if (response.class === cancelOption) {
              console.log(`${projects.action} cancelled, bye bye!`.green);
              process.exitCode = 0;
              process.exit();
            }
            next(null, response);
          }
        );
      },
      function (response, next) {
        inquirer.prompt(
          [
            {
              type: 'confirm',
              name: 'action',
              message: `You selected ${response.class}: Is that correct?`,
              default: true
            }
          ],
          function (confirm) {
            if (confirm.action) {
              return res({
                session: pluckSession(response.class, parsedSessions),
                projectAction: projects.action,
              });
            }
            res(selectSession(sessions));
          }
        );
      }
    ]);
  });
}

module.exports.selectSession = selectSession;
