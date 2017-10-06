const child = require('./child');
const github = require('./github');
const Promise = require('bluebird');

const getOrObtainAuth = Promise.promisify(github.getOrObtainAuth, github);

module.exports.all = function (commitMessage) {
  return addAll()
    .then(function () {
      commit(commitMessage);
    })
    .then(push);
};

function addAll() {
  return child.execute('git add -A');
}

function commit(commitMessage) {
  return child.execute(`git commit -m "${commitMessage}"`);
}

// TODO : Fix no user case - github needs to be debugged with bluebird to ensure user is returned //
function push() {
  const session = {};
  return getOrObtainAuth()
    .then(function (auth) {
      session.token = auth.token;
    })
    .then(github.getOrObtainUser)
    .then(function (user) {
      const repository = `${user.login}.github.io`;
      const cmd = `git push https://${session.token}@github.com/${user.login}/${repository}.git`;
      console.log(user);
      return;
      child.execute(cmd);
    });
}

module.exports.push = push;
