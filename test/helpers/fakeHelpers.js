const fs = require('fs');
const { dummyUser, dummyAuth, dummyGistGood } = require('./dummyData');

module.exports.createClient = () => dummyUser;

module.exports.getClient = () => new Promise((res, rej) => res(dummyUser));

module.exports.createGithubToken = () => `echo '${JSON.stringify(dummyAuth)}'`;

module.exports.deleteGithubToken = () => 'echo ""';

module.exports.readGithubAuths = () => `echo ${dummyUser}`;

module.exports.checkGithubAuth = () => 'echo \'{ "statusCode": 200 }\'';

module.exports.downloadProject = (url, token, directory) => fs.mkdir(directory);

module.exports.grabLocalUserID = () => `echo ${dummyUser.id}`;

module.exports.grabLocalLogin = () => `echo ${dummyUser.login}`;

module.exports.grabLocalAuthID = () => `echo ${dummyAuth.id}`;

module.exports.grabLocalAuthToken = () => `echo ${dummyAuth.token}`;

module.exports.downloadProjectTests = () => `echo ${dummyUser}`;

module.exports.downloadProjectPackage = () => `echo ${dummyUser}`;

module.exports.createGistHelper = () => `echo ${dummyGistGood}`;

module.exports.deleteGistHelper = () => `echo ${dummyUser}`;

module.exports.readGistHelper = () => `echo ${dummyUser}`;

module.exports.home = () => './test/files';
