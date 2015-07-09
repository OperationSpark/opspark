'use strict';

var os = require('os');

module.exports.home = function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

module.exports.hostname = function() {
    return os.hostname();
};