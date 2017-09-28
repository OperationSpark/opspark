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
  view = require('../view'),
  mkdirp = require('mkdirp'),
  exec = require('child_process').exec,
  request = require('request'),
  octonode = require('octonode'),
  env = require('./env'),
  applicationDirectory = env.home() + '/opspark',
  githubFilePath = applicationDirectory + '/github',
  userFilePath = applicationDirectory + '/user',
  _auth,
  _user,
  _client,
  _opspark;

// TODO : consider the "module level" vars, like _client in this implementation, are they necessary.

function getCredentials() {
  // get local creds
  // fs.existsSync, if yah, get file, extend documents together, and return //
  // if local creds, return creds
  console.log("Getting credentials. . .".yellow);
  return new Promise(function (res, rej) {
    if (fs.existsSync(githubFilePath) && fs.existsSync(userFilePath)) {
      const creds = {
        login: grabLocalLogin(),
        id: grabLocalID(),
        token: grabLocalToken()
      };
      console.log("Good to go!".green);
      res(creds);
    } else {
      rej("Whoops");
    }
  });
  // return Promise.resove(creds);

  // if not, return authorize()
}

module.exports.getCredentials = getCredentials;

function filesExist() {
  if (!fs.existsSync(githubFilePath) || !fs.existsSync(userFilePath)) {
    return false;
  }
  return true;
}

module.exports.filesExist = filesExist;

function user(username, complete) {
  var deferred = Q.defer();
  getOrCreateClient(function (err, client) {
    if (err) return deferred.reject(err);
    client.get('/users/' + username, {}, function (err, status, body, headers) {
      if (err) deferred.reject(err);
      else deferred.resolve(body);
    });
  });
  return deferred.promise.nodeify(complete);
}
module.exports.user = user;

module.exports.repo = function (username, repoName, complete) {
  getOrCreateClient(function (err, client) {
    if (err) return complete(err);
    var ghrepo = client.repo(username + '/' + username + '.github.io');
    ghrepo.info(function (er, statu, bod, header) {
      console.log(bod);
      complete(null, bod);
    });
  });
};

module.exports.limit = function (complete) {
  getOrCreateClient(function (err, client) {
    if (err) return complete(err);
    client.limit(function (err, left, max) {
      if (err) return complete(err);
      var message = 'GitHub limit: ' + left + ' used of ' + max + '.';
      complete(null, message);
    });
  });
};

module.exports.login = function () {
  inquirer.prompt({
    type: 'input',
    name: 'username',
    message: ''
  })
}

/*
 * TODO :
 * 1. Case for token exists at GitHub but has been deleted locally:
 *      a. curl to delete existing token, (user will need to provide creds).
 *      b. re-curl to install new token.
 *      OR
 *      a. add a timestamp to the hostname.
 */

function authorize(username, complete) {
  const note = getNoteForHost();
  const cmd = `curl https://api.github.com/authorizations --user "${username}" --data '{"scopes":["public_repo", "repo", "gist"],"note":"${note}","note_url":"https://www.npmjs.com/package/opspark"}'`;
  const child = exec(cmd);
  let output = null;
  child.stdout.on('data', function (data) {
    // console.log('stdout: ', data);
    output = JSON.parse(data);
    if (data.indexOf('token') > -1) {
      try {
        _auth = JSON.parse(data);
      } catch (err) {
        return complete(err);
      }
      console.log('GitHub login succeeded!'.green);
      writeToken(_auth);
      obtainAndWriteUser(username);
    }
  });
  child.stderr.on('data', function (data) {
    console.log(data);
  });
  child.on('close', function (code) {
    if (output.message) {
      return complete(output.message);
    }
    // console.log('closing code: ' + code);
    setTimeout(() => {
      complete(null, _auth);
    }, 500);
  });
}

module.exports.authorize = authorize;

function writeToken(token) {
  ensureApplicationDirectory();
  fsJson.saveSync(githubFilePath, token);
}
module.exports.writeToken = writeToken;

function repos(complete) {
  // the client also initializes opspark, which isn't very clear - 
  // perhaps you should refactor to create opspark here, or? //
  getOrCreateClient(function (err, client) {
    if (err) return complete(err);
    _opspark.repos(1, 100, function (err, repos) {
      if (err) return complete(err);
      complete(null, repos);
    });
  });
}
module.exports.repos = repos;

function getOrObtainAuth(complete) {
  if (_auth) return complete(null, _auth);
  if (fs.existsSync(githubFilePath)) {
    _auth = fsJson.loadSync(githubFilePath);
    hasAuthorization(_auth.token, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        return complete(null, _auth);
      } else {
        console.log('Hmm, something\'s not right!'.green);
        console.log('Let\'s try to login to GitHub again:'.green);
        if (fs.existsSync(githubFilePath)) fs.unlinkSync(githubFilePath);
        if (fs.existsSync(userFilePath)) fs.unlinkSync(userFilePath);
        obtainAuthorizationuthorization(complete);
      }
    });
  } else {
    obtainAuthorization(complete);
  }
}
module.exports.getOrObtainAuth = getOrObtainAuth;

function obtainAuthorization(complete) {
  view.inquireForInput('Enter your GitHub username', function (err, input) {
    if (err) return complete(err);
    authorize(input, function (err) {
      complete(err, _auth);
    });
  });
}

module.exports.obtainAuthorization = obtainAuthorization;

function grabLocalID() {
  const git = fsJson.loadSync(userFilePath);
  if (!git) {
    throw new Error(`There is no file at ${userFilePath}.`);
  }
  return git.id;
}

module.exports.grabLocalID = grabLocalID;

function grabLocalToken() {
  const git = fsJson.loadSync(githubFilePath);
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

function hasAuthorization(token, complete) {
  var options = {
    url: util.format('https://api.github.com/?access_token=%s', token),
    headers: {
      'User-Agent': config.userAgent
    }
  };
  request(options, complete);
}

function getOrCreateClient(complete) {
  if (_client) return complete(null, _client);

  getOrObtainAuth(function(err, auth) {
    if (err) return complete(err);
    _client = octonode.client(auth.token);
    _opspark = _client.org('OperationSpark');
    complete(null, _client);
  });
}

function listAuths(username, complete) {
  var cmd = 'curl -A "' + config.userAgent + '" --user "' + username + '" https://api.github.com/authorizations';
  var child = exec(cmd, function(err, stdout, stderr) {
    if (err) return complete(err);
    console.log('stdout: ', stdout.green);
    console.log('stdout: ', stderr.green);
    complete(err, stdout, stderr);
  });
}
module.exports.listAuths = listAuths;

function getNoteForHost() {
  return util.format(config.github.note, env.hostname());
}
module.exports.getNoteForHost = getNoteForHost;

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

function obtainAndWriteUser(username) {
  return user(username)
    .then(function(user) {
      writeUser(_user = user);
      return user;
    });
}

function writeUser(user) {
  ensureApplicationDirectory();
  fsJson.saveSync(userFilePath, user);
}

function ensureApplicationDirectory() {
  if (!fs.existsSync(applicationDirectory)) mkdirp.sync(applicationDirectory);
}

function deauthorize() {
  var getAuth = Promise.promisify(getOrObtainAuth);

  return getAuth()
    .then(function (auth) {
      var cmd = 'curl -X "DELETE" -A "' + config.userAgent + '" -H "Accept: application/json" https://api.github.com/authorizations/' + auth.id + ' --user "jfraboni"';
      return child.execute(cmd).then(function (result) {
        if (result.code === 0) {
          if (fs.existsSync(githubFilePath)) fs.unlinkSync(githubFilePath);
          if (fs.existsSync(userFilePath)) fs.unlinkSync(userFilePath);
        } else {
          console.log('Hmm, something went wrong trying to logout, please try again or ask for help.');
        }
      });
    });
}
module.exports.deauthorize = deauthorize;
