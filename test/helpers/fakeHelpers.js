const fs = require('node:fs/promises');
const {
  dummyUser,
  dummyAuth,
  dummyGistGood,
  dummyTestPass,
  dummyTestFail
} = require('./dummyData');

const { TEST_GITHUB_TOKEN } = process.env;
module.exports.home = () => './test/files';

module.exports.createClient = () => dummyUser;

module.exports.createGithubToken = () => `echo '${JSON.stringify(dummyAuth)}'`;

module.exports.deleteGithubToken = () => 'echo ""';

module.exports.readGithubAuths = () => `echo ${dummyUser}`;

module.exports.checkGithubAuth = () => 'echo \'{ "statusCode": 200 }\'';

module.exports.grabLocalUserID = () => `echo ${dummyUser.id}`;

module.exports.grabLocalLogin = () => `echo ${dummyUser.login}`;

module.exports.grabLocalAuthID = () => `echo ${dummyAuth.id}`;

module.exports.grabLocalAuthToken = () =>
  `${TEST_GITHUB_TOKEN || dummyAuth.token}`;

module.exports.createGistHelper = () => `echo '${dummyGistGood}'`;

module.exports.deleteGistHelper = () => `echo ${dummyUser}`;

module.exports.readGistHelper = () => `echo ${dummyUser}`;

module.exports.downloadProject = (url, token, directory) =>
  `mkdir ${directory} ${directory}/.git ${directory}/.svn ${directory}/.master ${directory}/test`;

module.exports.getClient = () => ({
  /**
   * Mocks the behavior real method, which fetches the project tests from github.
   * @param {string} url
   * @param {string} directory
   * @returns
   */
  async downloadProjectTests(url, directory) {
    return Promise.all([
      fs.mkdir(`${directory}/test`, { recursive: true }),
      fs.mkdir(`${directory}/node_modules`, { recursive: true })
    ]);
  },

  /**
   * Mocks the behavior real method, which fetches the project's package.json file.
   * @param {string} url
   * @param {string} directory
   * @returns
   */
  async downloadProjectPackage(url, directory) {
    // package.json must be parse-able JSON, so writing an empty object into it
    return fs.writeFile(`${directory}/package.json`, '{}', 'utf-8');
  }
});

module.exports.makeTestPass = () => `echo '${dummyTestPass}'`;

module.exports.makeTestFail = () => `echo '${dummyTestFail}'`;

module.exports.reportPass = () => Promise.resolve(JSON.parse(dummyTestPass));

module.exports.reportFail = () => Promise.resolve(JSON.parse(dummyTestFail));

module.exports.getGithubID = () => `echo  '{ "id": ${dummyUser.id} }'`;
