const dummyData = require('./dummyData');

module.exports.createClient = () => dummyData.dummyUser;

module.exports.getClient = () => new Promise((res, rej) => res(dummyData.dummyUser));

module.exports.createGithubToken = () => `echo '${JSON.stringify(dummyData.dummyAuth)}'`;

module.exports.deleteGithubToken = () => 'echo ""';

module.exports.readGithubAuths = () => `echo ${dummyData.dummy}`;

module.exports.checkGithubAuth = () => 'echo \'{ "statusCode": 200 }\'';

module.exports.downloadProject = () => `echo ${dummyData.dummyUser}`;

module.exports.downloadProjectTests = () => `echo ${dummyData.dummy}`;

module.exports.downloadProjectPackage = () => `echo ${dummyData.dummy}`;

module.exports.createGistHelper = () => `echo ${dummyData.dummyGistGood}`;

module.exports.deleteGistHelper = () => `echo ${dummyData.dummy}`;

module.exports.readGistHelper = () => `echo ${dummyData.dummy}`;

module.exports.home = () => './test/files';
