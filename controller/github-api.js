const fs = require('node:fs/promises');
const path = require('path');
const { Octokit } = require('octokit');
const { version } = require('../package.json');

/** @typedef {import("@octokit/openapi-types/types").components  } GitHubComponents */
/** @typedef {GitHubComponents["schemas"]["content-directory"] | GitHubComponents["schemas"]["content-file"] } GetContentResp */

class GithubAPI {
  /**
   *
   * @param {string} token
   * @returns
   */
  constructor(token) {
    this._client = new Octokit({
      auth: `token ${token}`,
      userAgent: `opspark_tool@${version}`
    });
  }

  /**
   *
   * @param {string} url
   * @returns {{owner: string, repo: string}}
   */
  static parseRepoUrl(url) {
    const parsed = new URL(url);
    return {
      owner: parsed.pathname.split('/')[1],
      repo: parsed.pathname.split('/')[2]
    };
  }
  /**
   *
   * @param {string} url
   * @param {string} directory
   */
  async downloadProjectTests(url, directory) {
    const { owner, repo } = GithubAPI.parseRepoUrl(url);
    const res = await this._client.rest.repos.getContent({
      owner,
      repo,
      path: 'test',
      recursive: true
    });

    if (res.status !== 200) {
      throw new Error('Failed to download tests');
    }

    /** @type GetContentResp[] | GetContentResp */
    if (!Array.isArray(res.data)) {
      // Single file?
      return;
    }

    await fs.mkdir(path.join(directory, 'test'), { recursive: true });
    const promises = res.data.map(async content =>
      this._downloadFiles(content, directory)
    );
    await Promise.all(promises);
  }

  /**
   * Downloads the package.json and .npmrc files for a project.
   * @param {string} url
   * @param {string} directory
   */
  async downloadProjectPackage(url, directory) {
    const files = ['package.json', '.npmrc'];
    const { owner, repo } = GithubAPI.parseRepoUrl(url);
    files.map(async filePath => {
      const res = await this._client.rest.repos.getContent({
        mediaType: { format: 'raw' },
        owner,
        repo,
        path: filePath
      });
      if (res.status !== 200) {
        throw new Error('Failed to download package');
      }
      await fs.writeFile(path.join(directory, filePath), res.data, {
        encoding: 'utf8'
      });
    });
  }
  /**
   * Downloads the files in a GitHub API contents response.
   * @param {GetContentResp} contents
   * @param {string} directory
   */
  // eslint-disable-next-line class-methods-use-this
  async _downloadFiles(contents, directory) {
    if (!directory) {
      throw new Error('No directory provided');
    }
    // TODO: Recursively create directories and write files
    if (contents.type === 'dir') {
      return;
    }

    const filePath = path.join(directory, contents.path);
    const res = await fetch(contents.download_url);
    if (!res.ok || !res.body) {
      throw new Error(
        `Failed to download file: ${contents.path}\n${res.statusText}`
      );
    }

    const fileContents = await res.text();
    await fs.writeFile(filePath, fileContents, { encoding: 'utf8' });
  }
}

let _client;
module.exports = {
  /**
   *
   * @param {string} token
   * @returns {GithubAPI}
   */

  getClient(token) {
    if (!token) throw new Error('No token provided');
    if (!_client) {
      _client = new GithubAPI(token);
    }
    return _client;
  }
};
