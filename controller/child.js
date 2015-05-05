var 
    fs = require('fs'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn;

function execute(command, complete) {
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
        complete(err, response, code);
    });
}
module.exports.authorize = execute;
