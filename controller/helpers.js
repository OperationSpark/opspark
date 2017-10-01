module.exports.getGithubToken = function (username, password, note) {
  console.log('I\'m a real helper');
  return `curl -u "${username}:${password}" -d '{"scopes":["public_repo", "repo", "gist"],"note":"${note}","note_url":"https://www.npmjs.com/package/opspark"}' https://api.github.com/authorizations`;
};

module.exports.deleteGithubToken = function (username, password, userAgent, authID) {
  console.log('I\'m a real helper');
  return `curl -X "DELETE" -u "${username}:${password}" -A "${userAgent}" -H "Accept: application/json" https://api.github.com/authorizations/${authID}`;
};

module.exports.readGithubAuths = function (username, password, userAgent) {
  return `curl -A "${userAgent}" -u "${username}:${password}" https://api.github.com/authorizations`;
};

module.exports.createGist = function (username, token, content) {
  return `curl -X POST -u "${username}:${token}" -d '${content}' https://api.github.com/gists`;
};

module.exports.deleteGist = function (username, token, url) {
  return `curl -X DELETE -u "${username}:${token}" ${url}`;
};
