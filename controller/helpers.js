module.exports.getGithubToken = function (username, password, note) {
  console.log('I\'m a real helper');
  return `curl https://api.github.com/authorizations --user "${username}:${password}" --data '{"scopes":["public_repo", "repo", "gist"],"note":"${note}","note_url":"https://www.npmjs.com/package/opspark"}'`;
};

module.exports.deleteGithubToken = function (username, password, userAgent, authID) {
  console.log('I\'m a real helper');
  return `curl -X "DELETE" -A "${userAgent}" -H "Accept: application/json" https://api.github.com/authorizations/${authID} --user "${username}:${password}"`;
};

module.exports.readGithubAuths = function (username, password, userAgent) {
  return `curl -A "${userAgent}" --user "${username}:${password}" https://api.github.com/authorizations`;
};
