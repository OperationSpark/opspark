const fs = require('fs');
const { dummyUser, dummyAuth, dummyGistGood, dummyTestPass, dummyTestFail } = require('./dummyData');

module.exports.home = () => './test/files';

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

module.exports.createGistHelper = () => `echo '${dummyGistGood}'`;

module.exports.deleteGistHelper = () => `echo ${dummyUser}`;

module.exports.readGistHelper = () => `echo ${dummyUser}`;

module.exports.downloadProject = (url, token, directory) => `mkdir ${directory} ${directory}/.git ${directory}/.svn ${directory}/.master ${directory}/test`;

module.exports.downloadProjectTests = (url, token, directory) => `mkdir ${directory}/test ${directory}/node_modules`;

// package.json must be parse-able, so echoing an empty object into it
module.exports.downloadProjectPackage = (url, token, directory) => `echo {} > ${directory}/package.json`;

module.exports.makeTestPass = () => `echo '${dummyTestPass}'`;

module.exports.makeTestFail = () => `echo '${dummyTestFail}'`;

module.exports.reportPass = () => Promise.resolve(JSON.parse(dummyTestPass));

module.exports.reportFail = () => Promise.resolve(JSON.parse(dummyTestFail));
