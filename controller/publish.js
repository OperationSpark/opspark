'use strict';

var 
    child = require('./child'),
    github = require('./github'),
    Promise = require('bluebird'),
    getOrObtainAuth = Promise.promisify(github.getOrObtainAuth, github);

module.exports.publish = function (repository, commitMessage) {
        return addAll()
            .then(commit('updates'))
            .then(push(repository));
};

function addAll() {
    return child.execute('git add -A');
}

function commit(commitMessage) {
    return child.execute('git commit -m" ' + commitMessage + ' "');
}

function push(repository) {
    var session = {};
    return getOrObtainAuth()
        .then(function (auth) {
            session.token = auth.token;
        })
        .then(github.getOrObtainUser())
        .then(function (user) {
            child.execute('git push https://' + session.token + '@github.com/' + 'OperationSpark' + '/' + repository + '.git');
        });
}
