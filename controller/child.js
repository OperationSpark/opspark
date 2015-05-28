'use strict';

var 
    fs = require('fs'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    Promise = require('bluebird');

function execute(command) {
    return new Promise(function (resolve, reject) {
        var err, response;
        var child = exec(command);
        child.stdout.on('data', function(data) {
            response = data;
            console.log('stdout: ', data);
        });
        child.stderr.on('data', function(data) {
            err = data;
            console.log('stderr: ', data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
            if (err) return reject(err);
            return resolve(response);
        });
    });
}
module.exports.execute = execute;
