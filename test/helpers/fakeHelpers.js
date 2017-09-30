const { dummyAuth } = require('./dummyData');

const githubAuthToken = function () {
  console.log('Hey');
  return `echo '${JSON.stringify(dummyAuth)}'`;
};

module.exports.githubAuthToken = githubAuthToken;
