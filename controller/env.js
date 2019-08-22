const os = require('os');

module.exports.home = function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

module.exports.hostname = function () {
  return os.hostname();
};

<<<<<<< HEAD
module.exports.codenvyUser = process.env.CHE_PROJECTS_ROOT;
=======
module.exports.cloud9User = !!process.env.C9_USER;

>>>>>>> 1bff9e7535c8fcf46b2ef519d8e0ad189e4553a4
