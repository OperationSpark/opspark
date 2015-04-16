'use strict';

var 
    config = require('../config'),
    view = require('../view'),
    github = require('./github'),
    projects = require('./projects');

module.exports.up = function(complete) {
    view.promptForInput(config.github.msg.enterUsername, 
        function(err, username) {
            if (err) return complete(err);
            github.user(username, function(err, user) {
                if (err) return complete(err);
                projects.list(function (err, list) {
                    if (err) return console.log(err + ''.red);
                    projects.selectProject(list, function(err, project) {
                        if (err) return console.log(err + ''.red);
                        projects.installProject(project, username, function () {
                            console.log('You\'ve paired up with %s', username);
                            complete(null);
                        });
                    });
                });
            });
        });
};

module.exports.down = function(complete) {
    console.log('coming soon...');
};
