'use strict';

var
    config = require('../config'),
    _ = require('lodash'),
    util = require('util'),
    Q = require('q'),
    fsJson = require('fs-json')(),
    changeCase = require('change-case'),
    async = require('async'),
    github = require('./github'),
    program = require('commander'),
    inquirer = require('inquirer'),
    colors = require('colors'),
    fs = require('fs'),
    url = require('url'),
    exec = require('child_process').exec,
    request = require('request'),
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    cancelOption = '[cancel]',
    rootDirectory = './',
    projectEntriesPath = 'projects/projects.json';


module.exports.handshake = function() {

}


module.exports.install = function() {
    list(function (err, projects) {
        if (err) return console.log(err + ''.red);
        selectProject(projects, function(err, project) {
            if (err) return console.log(err + ''.red);
            installProject(project, null, function () {
                console.log('Have fun!!!'.green);
            });
        });
    });
};

function greenlightRequest(hash) {
		var url: 'https://greenlight.operationspark.org/api/os/verify';

		request.post({url: url, formData: hash}, function optionalCallback(err, httpResponse, body) {
		  if (err) {
		    return console.error('upload failed:', err);
		  }
		  console.log('Upload successful!  Server responded with:', body);
		});
}
