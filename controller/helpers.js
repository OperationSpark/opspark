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
  return `svn co ${url}/trunk --password ${token} ${directory}`
};

module.exports.downloadProjectTests = function () {
  return ``;
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
