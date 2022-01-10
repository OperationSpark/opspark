require('cli-color');
const fs = require('fs');
const util = require('util');
const prompt = require('inquirer').prompt;
const mkdirp = require('mkdirp');
const fsJson = require('fs-json')();
const octonode = require('octonode');
const rp = require('request-promise');
const exec = require('child_process').exec;

const env = require('./env');
const config = require('../config');
const janitor = require('./janitor');
const { createGithubToken, deleteGithubToken, readGithubAuths, checkGithubAuth, createClient, getClient } = require('./helpers');

const applicationDirectory = `${env.home()}/opspark`;
const authFilePath = `${applicationDirectory}/auth`;
const userFilePath = `${applicationDirectory}/user`;
let _auth;
let _user;
let _client;
let _opspark;

// TODO : consider the "module level" vars, like _client in this implementation, are they necessary.

function getCredentials() {
  console.log('Getting credentials. . .'.yellow);
  return new Promise(function (res, rej) {
    if (userInfoExists()) {
      const creds = {
        login: grabLocalLogin(),
        id: grabLocalUserID(),
        token: grabLocalAuthToken()
      };
      console.log('Good to go!'.green);
      res(creds);
    } else {
      authorizeUser()
        .then(user => res(user))
        .catch(err => rej(err));
    }
  });
}

module.exports.getCredentials = getCredentials;

function authorizeUser() {
  return promptForUserInfo()
    .then(obtainAndWriteAuth)
    .then(obtainAndWriteUser)
    .then(() => {
      const creds = {
        login: grabLocalLogin(),
        id: grabLocalUserID(),
        token: grabLocalAuthToken()
      };
      return creds;
    });
}

module.exports.authorizeUser = authorizeUser;

function promptForUserInfo() {
  return new Promise(function (res, rej) {
    prompt(
      [
        {
          message: 'Enter your GitHub username',
          name: 'username',
          type: 'input',
          required: true
        },
        {
          message: 'Enter your GitHub password',
          name: 'password',
          type: 'password',
          hidden: true,
          conform: () => true,
        }
      ],
      function (user) {
        res(user);
      }
    );
  });
}

module.exports.promptForUserInfo = promptForUserInfo;

function writeAuth(auth) {
  deleteAuth();
  console.log('Writing auth. . .'.yellow);
  return new Promise(function (res, rej) {
    ensureApplicationDirectory();
    fsJson.saveSync(authFilePath, auth);
    res(true);
  });
}

module.exports.writeAuth = writeAuth;

function obtainAndWriteAuth({ username, password }) {
  console.log('Authorizing with GitHub. . .'.yellow);
  return new Promise(function (res, rej) {
    const note = getNoteForHost();
    const cmd = createGithubToken(username, password, note);
    exec(cmd, function (err, stdout, stderr) {
      _auth = JSON.parse(stdout);
      if (_auth.message) {
        rej(_auth);
      } else {
        console.log('GitHub login succeeded!'.green);
        _auth.username = username;
        writeAuth(_auth)
          .then(() => res(_auth));
      }
    });
  });
}

module.exports.obtainAndWriteAuth = obtainAndWriteAuth;

function writeUser(user) {
  deleteUser();
  console.log('Writing user. . .'.yellow);
  return new Promise(function (res, rej) {
    ensureApplicationDirectory();
    fsJson.saveSync(userFilePath, user);
    res(user);
  });
}

module.exports.writeUser = writeUser;

function obtainAndWriteUser(user) {
  console.log('Grabbing user. . .'.yellow);
  return new Promise(function (res, rej) {
    getOrCreateClient()
      .then(function (client) {
        getClient(client, user.username)
          .catch(err => rej(err))
          .then(writeUser)
          .then(user => res(user));
      })
      .catch(err => console.error(err));
  });
}

module.exports.obtainAndWriteUser = obtainAndWriteUser;

function getOrCreateClient() {
  return new Promise(function (res, rej) {
    if (_client) return res(_client);
    getOrObtainAuth()
      .then(function (auth) {
        _client = createClient(auth.token);
        // _opspark = _client.org('OperationSpark');
        res(_client);
      })
      .catch(err => console.error(err));
  });
}

module.exports.getOrCreateClient = getOrCreateClient;

function getOrObtainAuth() {
  return new Promise(function (res) {
    if (_auth) return res(_auth);
    if (fs.existsSync(authFilePath)) {
      _auth = fsJson.loadSync(authFilePath);
      hasAuthorization(_auth.token)
        .then(function (response) {
          if (response.statusCode === 200) {
            res(_auth);
          } else {
            console.log('Hmm, something\'s not right!'.green);
            console.log('Let\'s try to login to GitHub again:'.green);
            deleteUserInfo();
            authorizeUser();
          }
        })
        .catch(err => console.error(err));
    } else {
      authorizeUser();
    }
  });
}

module.exports.getOrObtainAuth = getOrObtainAuth;

function hasAuthorization(token) {
  return new Promise(function (res, rej) {
    const cmd = checkGithubAuth(token, config.userAgent);
    exec(cmd, function (err, stdout, stderr) {
      if (err) return rej(err);
      if (typeof stdout === 'string') {
        stdout = JSON.parse(stdout);
      }
      res(stdout);
    });
  });
}

module.exports.hasAuthorization = hasAuthorization;

function ensureApplicationDirectory() {
  if (!fs.existsSync(applicationDirectory)) mkdirp.sync(applicationDirectory);
}

module.exports.ensureApplicationDirectory = ensureApplicationDirectory;

function authExists() {
  return fs.existsSync(authFilePath);
}

module.exports.authExists = authExists;

function userExists() {
  return fs.existsSync(userFilePath);
}

module.exports.userExists = userExists;

function userInfoExists() {
  return authExists() && userExists();
}

module.exports.userInfoExists = userInfoExists;

function grabLocalUserID() {
  const git = fsJson.loadSync(userFilePath);
  if (!git) {
    throw new Error(`There is no file at ${userFilePath}.`);
  }
  return git.id;
}

module.exports.grabLocalUserID = grabLocalUserID;

function grabLocalLogin() {
  const git = fsJson.loadSync(userFilePath);
  if (!git) {
    throw new Error(`There is no file at ${userFilePath}.`);
  }
  return git.login;
}

module.exports.grabLocalLogin = grabLocalLogin;

function grabLocalAuthID() {
  const git = fsJson.loadSync(authFilePath);
  if (!git) {
    throw new Error(`There is no file at ${authFilePath}.`);
  }
  return git.id;
}

module.exports.grabLocalAuthID = grabLocalAuthID;

function grabLocalAuthToken() {
  const git = fsJson.loadSync(authFilePath);
  if (!git) {
    throw new Error(`There is no file at ${authFilePath}.`);
  }
  return git.token;
}

module.exports.grabLocalAuthToken = grabLocalAuthToken;

function deauthorizeUser() {
  return new Promise(function (res, rej) {
    promptForUserInfo()
      .then(deleteToken)
      .then(deleteUserInfo)
      .then(() => {
        console.log('Successfully logged out!'.blue);
        res(true);
      })
      .catch(err => rej(`${err}`.red));
  });
}

module.exports.deauthorizeUser = deauthorizeUser;

function deleteToken({ username, password }) {
  console.log('Deleting token. . .'.red);
  return new Promise(function (res, rej) {
    const cmd = deleteGithubToken(username, password, config.userAgent, grabLocalAuthID());
    exec(cmd, function (err, stdout, stderr) {
      if (stdout.indexOf('message') > -1) return rej(stdout);
      res(stdout);
    });
  });
}

module.exports.deleteToken = deleteToken;

function deleteAuth() {
  if (fs.existsSync(authFilePath)) fs.unlinkSync(authFilePath);
}

module.exports.deleteAuth = deleteAuth;

function deleteUser() {
  if (fs.existsSync(userFilePath)) fs.unlinkSync(userFilePath);
}

module.exports.deleteUser = deleteUser;

function deleteUserInfo() {
  console.log('Deleting files. . .'.red);
  deleteAuth();
  deleteUser();
}

module.exports.deleteUserInfo = deleteUserInfo;

function obtainAuths(user) {
  return new Promise(function (res, rej) {
    const cmd = readGithubAuths(user.username, user.password, config.userAgent);
    exec(cmd, function (err, stdout) {
      if (err) return rej(err);
      res(JSON.parse(stdout));
    });
  });
}

function listAuths() {
  promptForUserInfo()
    .then(obtainAuths)
    .then(res => console.log(res))
    .catch(err => console.error(err));
}

module.exports.listAuths = listAuths;

function getNoteForHost() {
  return util.format(config.github.note, env.hostname());
}

module.exports.getNoteForHost = getNoteForHost;

// module.exports.repo = function (username, repoName, complete) {
//   getOrCreateClient()
//     .then(function (client) {
//       const ghrepo = client.repo(`${username}/${username}.github.io`);
//       ghrepo.info(function (er, statu, bod, header) {
//         console.log(bod);
//         complete(null, bod);
//       });
//     })
//     .catch(err => console.error(err));
// };

// module.exports.limit = function (complete) {
//   getOrCreateClient()
//     .then(function (client) {
//       client.limit(function (err, left, max) {
//         if (err) return complete(err);
//         const message = `GitHub limit: ${left} used of ${max}.`;
//         complete(null, message);
//       });
//     })
//     .catch(err => console.error(err));
// };

// function repos(complete) {
//   // the client also initializes opspark, which isn't very clear -
//   // perhaps you should refactor to create opspark here, or? //
//   getOrCreateClient()
//     .then(function (client) {
//       _opspark.repos(1, 100, function (repos) {
//         // if (err) return complete(err);
//         complete(null, repos);
//       });
//     })
//     .catch(err => console.log(err));
// }
// module.exports.repos = repos;
