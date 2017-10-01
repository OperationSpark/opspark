const { dummyAuth } = require('./dummyData');

const getGithubToken = function () {
  console.log('I\'m a fake helper');
  return `echo '${JSON.stringify(dummyAuth)}'`;
};

module.exports.getGithubToken = getGithubToken;
