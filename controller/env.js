const os = require('os');

module.exports.home = function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

module.exports.hostname = function () {
  return os.hostname();
};
// codenvy project filePath /projects
module.exports.codenvyUser = process.env.CHE_PROJECTS_ROOT;
// cloud9 user name
module.exports.cloud9User = !!process.env.C9_USER;
