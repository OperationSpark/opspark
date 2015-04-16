'use strict';

var 
    view = require('cli-view'),
    exec = require('child_process').exec,
    request = require('request'),
    github = require('octonode'),
    client = github.client();
    
module.exports.user = function(username, complete) {
    client.get('/users/' + username, {}, function (err, status, body, headers) {
        if (err) return complete(err);
        return complete(null, body);
    });
};

module.exports.repo = function (username, repoName, complete) {
    var ghrepo = client.repo(username + '/' + username + '.github.io');
    ghrepo.info(function (er, statu, bod, header) {
        console.log(bod);
        complete(null, bod);
    });
};

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

