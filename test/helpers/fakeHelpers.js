const { dummyAuth } = require('./dummyData');

const createGithubToken = function () {
  console.log('I\'m a fake helper');
  return `echo '${JSON.stringify(dummyAuth)}'`;
};

module.exports.createGithubToken = createGithubToken;
