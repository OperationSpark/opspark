var
  fs = require('fs'),
  github = require('./controller/github'),
  colors = require('colors'),
  env = require('./controller/env'),
  applicationDirectory = env.home() + '/opspark',
  githubFilePath = applicationDirectory + '/github',
  userFilePath = applicationDirectory + '/user';

// this returns a promise //
function getCredentials() {
  // get local creds
  // fs.existsSync, if yah, get file, extend documents together, and return //
  // if local creds, return creds
  console.log('Getting credentials. . .'.yellow);
  return new Promise(function (res, rej) {
    if (fs.existsSync(githubFilePath) && fs.existsSync(userFilePath)) {
      const creds = {
        login: github.grabLocalLogin(),
        id: github.grabLocalUserID(),
        token: github.grabLocalAuthToken(),
      };
      console.log('Good to go!'.green);
      res(creds);
    } else {
      res('Whoops');
    }
  });
  // return Promise.resove(creds);

  // if not, return authorize()
}

module.exports.getCredentials = getCredentials;


function authorize() {
  // prompt for username //
  // wait, 

  // exec 'curl' start login process //

  // if err, exit program

  // on success, write creds to file system sync, resolve creds //

}

function getSessions(credentials) {
  // take credentials and send them to greenlight to get 
  // return credential
}

function showEnrolledOpenSession(sessions) {

  // async ask the user to select the session from which to install a project //
  // wait for prompt to send back user requested session //

  return {} // return selected session
}

function selectProjectFromSession(session) {

  // 
  // show prompt, 
  //  (bail?) exit.
  // wait for user, get selected project

  return {} // return selected project
}

function installProject() {

}
