'use strict';

var os = require('os');

module.exports.home = function () {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

module.exports.hostname = function() {
    return os.hostname();
};