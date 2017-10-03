const fs = require('fs');
const { dummyUser, dummyAuth, dummyGistGood } = require('./dummyData');

module.exports.createClient = () => dummyUser;

module.exports.getClient = () => new Promise((res, rej) => res(dummyUser));

module.exports.createGithubToken = () => `echo '${JSON.stringify(dummyAuth)}'`;

module.exports.deleteGithubToken = () => 'echo ""';

module.exports.readGithubAuths = () => `echo ${dummyUser}`;

module.exports.checkGithubAuth = () => 'echo \'{ "statusCode": 200 }\'';

module.exports.grabLocalUserID = () => `echo ${dummyUser.id}`;

module.exports.grabLocalLogin = () => `echo ${dummyUser.login}`;

module.exports.grabLocalAuthID = () => `echo ${dummyAuth.id}`;

module.exports.grabLocalAuthToken = () => `echo ${dummyAuth.token}`;

module.exports.createGistHelper = () => `echo ${dummyGistGood}`;

module.exports.deleteGistHelper = () => `echo ${dummyUser}`;

module.exports.readGistHelper = () => `echo ${dummyUser}`;

module.exports.home = () => './test/files';

module.exports.downloadProject = (url, token, directory) => {
  fs.mkdir(directory);
  fs.mkdir(`${directory}/.git`);
  fs.mkdir(`${directory}/.svn`);
  fs.mkdir(`${directory}/.master`);
  fs.mkdir(`${directory}/test`);
};

module.exports.downloadProjectTests = (url, token, directory) => {
  fs.mkdir(`${directory}/test`);
  fs.mkdir(`${directory}/node_modules`);
};

module.exports.downloadProjectPackage = (url, token, directory) => {
  fs.writeFileSync(`${directory}/package.json`);
};
