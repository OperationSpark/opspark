const { dummyAuth, dummyUser } = require('./dummyData');

const githubAuthToken = function () {
  return `echo '${JSON.stringify(dummyAuth)}'`;
};

module.exports.githubAuthToken = githubAuthToken;
