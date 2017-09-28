'use strict';

// TODO : re-write using decorator or chain of command (connect?), and use bluebird //

var
  config = require('../config'),
  Promise = require("bluebird"),
  Q = require("bluebird-q"),
  _ = require('lodash'),
  util = require('util'),
  fs = require('fs'),
  fsJson = require('fs-json')(),
  child = require('./child'),
  colors = require('colors'),
  prompt = require('prompt'),
  view = require('../view'),
  mkdirp = require('mkdirp'),
  exec = require('child_process').exec,
  request = require('request'),
  rp = require('request-promise'),
  octonode = require('octonode'),
  env = require('./env'),
  applicationDirectory = env.home() + '/opspark',
  authFilePath = applicationDirectory + '/auth',
  userFilePath = applicationDirectory + '/user',
  _auth,
  _user,
  _client,
  _opspark;

// TODO : consider the "module level" vars, like _client in this implementation, are they necessary.

function getCredentials() {
  console.log("Getting credentials. . .".yellow);
  return new Promise(function (res, rej) {
    if (filesExist()) {
      const creds = {
        login: grabLocalLogin(),
        id: grabLocalID(),
        token: grabLocalToken()
      };
      console.log("Good to go!".green);
      res(creds);
    } else {
      res(authorizeUser());
    }
  });
}

module.exports.getCredentials = getCredentials;

function authorizeUser() {
  return new Promise(function(res, rej) {
    promptForUserInfo()
      .then(getAuthorization)
      .then(writeUserInfo)
      .then(auth => {
        const creds = {
          login: grabLocalLogin(),
          id: grabLocalID(),
          token: grabLocalToken()
        };
        res(creds);
      })
      .catch(err => console.log(`${err}`.red));
  });
}

function promptForUserInfo() {
  return new Promise(function (res, rej) {
    prompt.get(
      [
        {
          description: 'Enter your GitHub username',
          name: 'username',
          required: true
        },
        {
          description: 'Enter your GitHub password',
          name: 'password',
          hidden: true,
          conform: () => true,
        }
      ],
      function (err, user) {
        if (err) return rej(err);
        res(user);
      }
    );
  });
}

module.exports.promptForUserInfo = promptForUserInfo;

function getAuthorization({ username, password }) {
  console.log('Authorizing with GitHub. . .'.yellow);
  return new Promise(function (res, rej) {
    const note = getNoteForHost();
    const cmd = `curl https://api.github.com/authorizations --user "${username}:${password}" --data '{"scopes":["public_repo", "repo", "gist"],"note":"${note}","note_url":"https://www.npmjs.com/package/opspark"}'`;
    exec(cmd, function (err, stdout, stderr) {
      _auth = JSON.parse(stdout);
      if (_auth.message) {
        rej(_auth.message);
      } else {
        console.log('GitHub login succeeded!'.green);
        _auth.username = username;
        res(_auth);
      }
    });
  });
}

module.exports.getAuthorization = getAuthorization;

function writeUserInfo(auth) {
  console.log('Saving user information. . .'.yellow);
  return new Promise(function (res, rej) {
    writeAuth(auth);
    console.log('I finished the auth file!');
    obtainAndWriteUser(auth.username);
  });
}

module.exports.writeUserInfo = writeUserInfo;

function deleteUserInfo() {
  if (fs.existsSync(authFilePath)) fs.unlinkSync(authFilePath);
  if (fs.existsSync(userFilePath)) fs.unlinkSync(userFilePath);
}

module.exports.deleteUserInfo = deleteUserInfo;







function filesExist() {
  return fs.existsSync(authFilePath) && fs.existsSync(userFilePath);
}

module.exports.filesExist = filesExist;

function obtainAndWriteUser(username) {
  console.log('Obtain and write user!');
  return user(username)
    .then(function (user) {
      writeUser(_user = user);
      return user;
    });
}

function user(username, complete) {
  console.log('User!!!', username);
  const deferred = Q.defer();
  getOrCreateClient()
    .then(function (client) {
      client.get('/users/' + username, {}, function (err, status, body, headers) {
        if (err) deferred.reject(err);
        else deferred.resolve(body);
      });
    })
    .catch(err => console.error(err));
  return deferred.promise.nodeify(complete);
}
module.exports.user = user;

module.exports.repo = function (username, repoName, complete) {
  getOrCreateClient
    .then(function (client) {
      var ghrepo = client.repo(username + '/' + username + '.github.io');
      ghrepo.info(function (er, statu, bod, header) {
        console.log(bod);
        complete(null, bod);
      });
    })
    .catch(err => console.error(err));
};

module.exports.limit = function (complete) {
  getOrCreateClient
    .then(function (client) {
      client.limit(function(err, left, max) {
        if (err) return complete(err);
        var message = "GitHub limit: " + left + " used of " + max + ".";
        complete(null, message);
      });
    })
    .catch(err => console.error(err));    
};

function repos(complete) {
  // the client also initializes opspark, which isn't very clear - 
  // perhaps you should refactor to create opspark here, or? //
  getOrCreateClient
    .then(function (client) {
      _opspark.repos(1, 100, function (repos) {
        if (err) return complete(err);
        complete(null, repos);
      })
    })
    .catch(err => console.log(err));
}
module.exports.repos = repos;

function getOrCreateClient() {
  console.log('GET OR CREATE CLIENT');
  return new Promise(function (res, rej) {
    if (_client) return res(_client);

    getOrObtainAuth()
      .then(function(auth) {
        _client = octonode.client(auth.token);
        _opspark = _client.org("OperationSpark");
        res(_client);
      })
      .catch(err => console.error(err));
  });
}

function getOrObtainAuth() {
  console.log('Get or obtain auth!!!!');
  return new Promise(function (res) {
    if (_auth) return res(_auth);
    if (fs.existsSync(authFilePath)) {
      _auth = fsJson.loadSync(authFilePath);
      hasAuthorization(_auth.token)
        .then(function (response) {
          if (response.statusCode == 200) {
            return complete(null, _auth);
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
  console.log('Has authorization', token);
  var options = {
    url: util.format('https://api.github.com/?access_token=%s', token),
    headers: {
      'User-Agent': config.userAgent
    }
  };
  return rp(options);
}

function grabLocalID() {
  const git = fsJson.loadSync(userFilePath);
  if (!git) {
    throw new Error(`There is no file at ${userFilePath}.`);
  }
  return git.id;
}

module.exports.grabLocalID = grabLocalID;

function grabLocalToken() {
  const git = fsJson.loadSync(authFilePath);
  if (!git) {
    throw new Error(`There is no file at ${githubFilePath}.`);
  }
  return git.token;
}

module.exports.grabLocalToken = grabLocalToken;

function grabLocalLogin() {
  const git = fsJson.loadSync(userFilePath);
  if (!git) {
    throw new Error(`There is no file at ${userFilePath}.`);
  }
  return git.login;
}

module.exports.grabLocalLogin = grabLocalLogin;






function getOrObtainUser() {
  if (_user) return Q.when(_user);
  if (fs.existsSync(userFilePath)) {
    _user = fsJson.loadSync(userFilePath);
    if (_user) return Q.when(_user);
    return Q.reject(new Error('A race condition occurred while trying to load the user!'));
  }
  return obtainUser();
}
module.exports.getOrObtainUser = getOrObtainUser;

function obtainUser() {
  /*
   * First, check if we have auth: getOrObtainAuth() will obtain the user
   *
   * 1. If we have auth and no user, it's cause the env was authed before
   *    we were storing the user, so just get the user.
   * 2. If we don't have auth, just auth, then return the user, cause the auth
   *    process installs the user.
   */
  return new Promise(function (resolve, reject) {
    getOrObtainAuth(function (err, auth) {
      if (err) return reject(err);
      if (_user) return resolve(_user);
      console.log('Before we proceed, we need to retrieve your GitHub user:');
      return view.promptForInput('Enter your GitHub username')
        .then(obtainAndWriteUser);
    });
  });
}
module.exports.obtainUser = obtainUser;

function promptForUserName() {
  var deferred = Q.defer();
  view.promptForInput('Enter your GitHub username', function (err, input) {
    if (err) return deferred.reject(err);
    deferred.resolve(input);
  });
  return deferred.promise;
}



function ensureApplicationDirectory() {
  if (!fs.existsSync(applicationDirectory)) mkdirp.sync(applicationDirectory);
}

module.exports.ensureApplicationDirectory = ensureApplicationDirectory;

function writeAuth(auth) {
  console.log('github'.green, auth);
  return new Promise(function(res, rej) {
    ensureApplicationDirectory();
    fsJson.saveSync(authFilePath, auth);
  });
}

module.exports.writeAuth = writeAuth;

function writeUser(user) {
  console.log('user'.green, user);
  return new Promise(function(res, rej) {
    ensureApplicationDirectory();
    fsJson.saveSync(userFilePath, user);
  });
}

module.exports.writeUser = writeUser;

function deauthorizeUser() {
  var getAuth = Promise.promisify(getOrObtainAuth);

  return getAuth()
    .then(function (auth) {
      const cmd = `curl -X "DELETE" -A "${config.userAgent}" -H "Accept: application/json" https://api.github.com/authorizations/${auth.id} --user "${grabLocalLogin()}"`;
      return child.execute(cmd).then(function (result) {
        if (result.code === 0) {
          deleteUserInfo();
        } else {
          console.log('Hmm, something went wrong trying to logout, please try again or ask for help.');
        }
      });
    });
}
module.exports.deauthorizeUser = deauthorizeUser;

function listAuths(username, complete) {
  var cmd =
    'curl -A "' +
    config.userAgent +
    '" --user "' +
    username +
    '" https://api.github.com/authorizations';
  exec(cmd, function(err, stdout, stderr) {
    if (err) return complete(err);
    console.log("stdout: ", stdout.green);
    console.log("stdout: ", stderr.green);
    complete(err, stdout, stderr);
  });
}
module.exports.listAuths = listAuths;

function getNoteForHost() {
  return util.format(config.github.note, env.hostname());
}
module.exports.getNoteForHost = getNoteForHost;