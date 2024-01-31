const clc = require('cli-color');
const fs = require('fs');
const util = require('util');
const prompt = require('inquirer').prompt;
const mkdirp = require('mkdirp');
const fsJson = require('fs-json')();

const exec = require('child_process').exec;

const env = require('./env');
const config = require('../config.json');
const {
  createGithubToken,
  deleteGithubToken,
  readGithubAuths,
  checkGithubAuth,
  getGithubID
} = require('./helpers');

const applicationDirectory = `${env.home()}/opspark`;
const authFilePath = `${applicationDirectory}/auth`;
const userFilePath = `${applicationDirectory}/user`;
let _auth;
let _client;

// TODO : consider the "module level" vars, like _client in this implementation, are they necessary.

function getCredentials() {
  console.log(clc.yellow('Getting credentials. . .'));
  return new Promise(function (res, rej) {
    if (userInfoExists()) {
      const creds = {
        login: grabLocalLogin(),
        id: grabLocalUserID(),
        token: grabLocalAuthToken()
      };
      console.log(clc.green('Good to go!'));
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
    .then(writeAuth)
    .then(writeUser)
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

/**
 * Prompts the user for their GitHub username and personal access token (PAT).
 * @returns {Promise<{username: string, token: string}>}
 */
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
          message: 'Enter your GitHub personal token',
          name: 'token',
          type: 'token',
          hidden: true,
          conform: () => true
        }
      ],
      /** @param {{username: string, token: string}} user */
      function (user) {
        res(user);
      }
    );
  });
}

module.exports.promptForUserInfo = promptForUserInfo;

/**
 *
 * @param {object} auth
 * @param {string} auth.token GitHub Personal Access Token
 * @param {string} auth.username GitHub username
 * @returns {Promise<{token: string, username: string}>}
 */
function writeAuth(auth) {
  deleteAuth();
  console.log(clc.yellow('Writing auth. . .'));
  return new Promise(function (res, rej) {
    ensureApplicationDirectory();
    fsJson.saveSync(authFilePath, { token: auth.token });
    res(auth);
  });
}

module.exports.writeAuth = writeAuth;

function obtainAndWriteAuth({ username, password }) {
  console.log(clc.yellow('Authorizing with GitHub. . .'));
  return new Promise(function (res, rej) {
    const note = getNoteForHost();
    const cmd = createGithubToken(username, password, note);
    exec(cmd, function (err, stdout, stderr) {
      _auth = JSON.parse(stdout);
      if (_auth.message) {
        rej(_auth);
      } else {
        console.log(clc.green('GitHub login succeeded!'));
        _auth.username = username;
        writeAuth(_auth).then(() => res(_auth));
      }
    });
  });
}

module.exports.obtainAndWriteAuth = obtainAndWriteAuth;

/**
 * Writes the user to the file system. This function
 * will overwrite any existing user file.
 * @param {{ token: string, username: string}} auth
 * @returns
 */
function writeUser(auth) {
  deleteUser();
  console.log(clc.yellow('Writing user. . .'));
  return new Promise(function (res, rej) {
    const cmd = getGithubID(auth.token);
    exec(cmd, function (err, stdout, stderr) {
      try {
        const { id, message } = JSON.parse(stdout);
        if (err) {
          rej(err);
          return;
        } else if (message) {
          rej(message);
          return;
        }
        ensureApplicationDirectory();
        fsJson.saveSync(userFilePath, {
          id,
          username: auth.username
        });
        res(auth);
      } catch (_err) {
        return rej(`Non-JSON response:\n${stdout}`);
      }
    });
  });
}

module.exports.writeUser = writeUser;

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
            console.log(clc.green("Hmm, something's not right!"));
            console.log(clc.green("Let's try to login to GitHub again:"));
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
        // eslint-disable-next-line no-param-reassign
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
  // Failover to `login` for backward-compatibility
  return git.username || git.login;
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

async function deauthorizeUser() {
  try {
    deleteUserInfo();
    console.log(clc.blue('Successfully logged out!'));
    return true;
  } catch (error) {
    return Promise.reject(clc.red(`${error}`));
  }
}

module.exports.deauthorizeUser = deauthorizeUser;

function deleteToken({ username, password }) {
  console.log(clc.red('Deleting token. . .'));
  return new Promise(function (res, rej) {
    const cmd = deleteGithubToken(
      username,
      password,
      config.userAgent,
      grabLocalAuthID()
    );
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

// TODO: Should be async
/**
 * Deletes the auth and user files.
 */
function deleteUserInfo() {
  console.log(clc.red('Deleting files. . .'));
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
