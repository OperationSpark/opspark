const exec = require('child_process').exec;
// const Promise = require('bluebird');

function execute(command) {
  return new Promise(function (resolve, reject) {
    var stderr, stdout;
    var child = exec(command);
    child.stdout.on('data', function(data) {
      stdout = data;
      console.log('stdout: ', data);
    });
    child.stderr.on('data', function(data) {
      stderr = data;
      console.log('stderr: ', data);
    });
    child.on('close', function(code) {
      console.log('closing code: ' + code);
      return resolve({stdout: stdout, stderr: stderr, code: code});
    });
  });
}
module.exports.execute = execute;
