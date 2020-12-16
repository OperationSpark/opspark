const octonode = require('octonode');
const exec = require('child_process').exec;

module.exports.execAsync = function execAsync(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return rej(err);
      return res(stdout, stderr);
    });
  });
};

module.exports.createClient = function (token) {
  return octonode.client(token);
};

module.exports.getClient = function (client, username) {
  return new Promise(function (res, rej) {
    client.get(`/users/${username}`, {}, function (err, status, body) {
      if (err) rej(err);
      else res(body);
    });
  });
};

module.exports.createGithubToken = function (username, password, note) {
  return `curl -u "${username}:${password}" -d '{"scopes":["public_repo", "repo", "gist"],"note":"${note}","note_url":"https://www.npmjs.com/package/opspark"}' https://api.github.com/authorizations`;
};

module.exports.deleteGithubToken = function (username, password, userAgent, authID) {
  return `curl -X "DELETE" -u "${username}:${password}" -A "${userAgent}" -H "Accept: application/json" https://api.github.com/authorizations/${authID}`;
};

module.exports.readGithubAuths = function (username, password, userAgent) {
  return `curl -A "${userAgent}" -u "${username}:${password}" https://api.github.com/authorizations`;
};

module.exports.checkGithubAuth = function (token, userAgent) {
  return `curl -A ${userAgent} https://api.github.com/?access_token=${token}`;
};

module.exports.downloadProject = function (url, token, directory) {
  return `svn co ${url}/trunk --password ${token} ${directory}`;
};

module.exports.downloadProjectTests = function (url, token, directory) {
  return `svn export ${url}/trunk/test --password ${token} ${directory}/test`;
};

module.exports.downloadProjectPackage = function (url, token, directory) {
  return `svn export ${url}/trunk/package.json --password ${token} ${directory}/package.json && svn export ${url}/trunk/.npmrc --password ${token} ${directory}/.npmrc`;
};

module.exports.createGistHelper = function (username, token, content) {
  return `curl -X POST -u "${username}:${token}" -d '${content}' https://api.github.com/gists`;
};

module.exports.deleteGistHelper = function (username, token, url) {
  return `curl -X DELETE -u "${username}:${token}" ${url}`;
};

module.exports.readGistHelper = function (url) {
  return `curl ${url}`;
};

module.exports.installProjectDependenciesCmd = function(directory) {
  return `npm install --prefix ${directory} --loglevel=error`;
};

module.exports.removeProjectTestsCmd = function(directory) {
  return `rm -rf ${directory}/test`;
};

module.exports.getGithubID = function (token) {
  return `curl -H "Accept: application/vnd.github.v3+json" -H "Authorization: Bearer ${token}" https://api.github.com/user`;
};
