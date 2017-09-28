var
  _ = require('lodash'),
  changeCase = require('change-case'),
  async = require('async'),
  projects = require('./projects'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  cancelOption = '[cancel]';

function listSessions(sessions) {
  console.log("Grabbing sessions. . .".yellow);
  const sessionNames = _.map(sessions, session =>
    changeCase.titleCase(session.cohort)
  );
  const resolve = {
    sessions,
    sessionNames
  };
  return sessionNames;
}

module.exports.listSessions = listSessions;

function pluckSession(cohort, sessions) {
  const dashCohort = changeCase.paramCase(cohort);
  const sessionsArray = _.map(sessions, session => session);
  return sessionsArray.reduce(function(result, current) {
    return current.cohort === dashCohort ? current : result;
  });
}

module.exports.pluckSession = pluckSession;

function selectSession(sessions) {
  const parsedSessions = JSON.parse(sessions);
  const sessionNames = listSessions(parsedSessions);
  return new Promise(function (res, rej) {
    async.waterfall([
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
              console.log('Installation cancelled, bye bye!'.green);
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
