const githubAuthToken = function (username, password, note) {
  console.log('I\'m a real helper');
  return `curl https://api.github.com/authorizations --user "${username}:${password}" --data '{"scopes":["public_repo", "repo", "gist"],"note":"${note}","note_url":"https://www.npmjs.com/package/opspark"}'`;
}

module.exports.githubAuthToken = githubAuthToken;
