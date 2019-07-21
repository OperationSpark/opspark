const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports.home = function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

module.exports.hostname = function () {
  return os.hostname();
};

module.exports.githubDir = function () {
  const githubMatch = /[\w]+\.github\.io/;
  const githubDir = fs.readdirSync(`${module.exports.home()}/environment`).filter(dir => githubMatch.test(dir))[0];
  return githubDir;
};