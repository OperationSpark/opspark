'use strict';

var 
    _ = require('lodash'),
    fs = require('fs'),
    fsJson = require('fs-json')(),
    view = require('../view'),
    mkdirp = require('mkdirp'),
    exec = require('child_process').exec,
    request = require('request'),
    github = require('octonode'),
    authDirectory = getUserHome() + '/opspark',
    authFilePath = authDirectory + '/github',
    _auth,
    _client,
    _opspark;
    
// TODO : consider the "module level" vars, like _client in this implementation, are they necessary.


module.exports.user = function(username, complete) {
    getOrCreateClient(function (err, client) {
        if (err) return complete(err);
        client.get('/users/' + username, {}, function (err, status, body, headers) {
            if (err) return complete(err);
            return complete(null, body);
        });
    });
};

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

// TODO : UPDATE TO USE TOKEN //
module.exports.projects = function (username, complete) {
    var projects;
    var userRepo = username + '/' + username + '.github.io';
    var url = 'https://raw.githubusercontent.com/' + userRepo + '/master/projects/projects.json';
    
    request(url, function (err, response, body) {
        if (err) return complete(err);
        projects = JSON.parse(body);
        console.log(body);
        complete(null, projects);
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

function authorize(username, complete) {
    var cmd = 'curl https://api.github.com/authorizations --user "' + username + '" --data \'{"scopes":["public_repo", "gist"],"note":"opspark: cli util to install, setup, and grade student projects"}\'';
    var child = exec(cmd);
    child.stdout.on('data', function(data) {
        console.log('stdout: ', data);
        if (data.indexOf('token') > -1) {
            try {
                _auth = JSON.parse(data);
            } catch (err) {
                return complete(err);
            }
            console.log('github login succeeded!');
            writeToken(_auth);
        }
    });
    child.stderr.on('data', function(data) {
        console.log(data);
    });
    child.on('close', function(code) {
        console.log('closing code: ' + code);
        complete(null, _auth);
    });
}
module.exports.authorize = authorize;

function writeToken(token) {
    if (!fs.existsSync(authDirectory)) mkdirp.sync(authDirectory);
    fsJson.saveSync(authFilePath, token);
}
module.exports.writeToken = writeToken;

function repos(complete) {
    // the client also initializes opspark, which isn't very clear - perhaps you should refactor to create opspark here, or? //
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
    if (fs.existsSync(authFilePath)) {
        _auth = fsJson.loadSync(authFilePath);
        // assume if we have a token key, we've corectly loaded the auth //
        if (_.has(_auth, 'token')) return complete(null, _auth);
    }
    
    view.promptForInput('Enter your GitHub username', function (err, input) {
        if (err) return complete(err);
        authorize(input, function(){
            complete(null, _auth);
        });
    });
}

function getOrCreateClient(complete) {
    if (_client) return complete(null, _client);
    
    getOrObtainAuth(function(err, auth) {
        if (err) return complete(err);
        _client = github.client(auth.token);
        _opspark = _client.org('OperationSpark');
        complete(null, _client);
    });
}

// TODO : consider moving to another module //
function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
module.exports.getUserHome = getUserHome;

function listAuths(username, complete) {
    var cmd = 'curl --user "' + username + '" https://api.github.com/authorizations';
    var child = exec(cmd, function(err, stdout, stderr) {
        if (err) return complete(err);
        console.log(stdout.green);
        console.log(stderr.green);
        complete(err, stdout, stderr);
    });
}
module.exports.listAuths = listAuths;