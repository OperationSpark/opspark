'use strict';

var
  _ = require('lodash'),
  github = require('./github'),
  test = require('./test'),
  projects = require('./projects-copy'),
  program = require('commander'),
  inquirer = require('inquirer'),
  colors = require('colors'),
  exec = require('child_process').exec,
  rp = require('request-promise');

function submit() {
  test.test(true);
}

module.exports.submit = submit;

function checkGrade(stats) {
  if (stats.tests !== stats.passes) {
    console.log('You have not passed all tests! Canceling submit.'.red);
  } else {
    console.log('Great! Beginning the upload process. . .'.green);
    createGist();
  }
}

module.exports.checkGrade = checkGrade;

function createGist(stats) {
  const cmd = `curl -X POST -d '{"public":true,"files":{"grade.txt":{"content":""}}}' -u ${github.grabLocalLogin()}:${github.grabLocalToken()} https://api.github.com/gists`


  // const body = {
  //   description: 'the description for this gist',
  //   public: true,
  //   login: github.grabLocalLogin(),
  //   files: {
  //     'grade.txt': {
  //       content: 'hi',
  //     }
  //   },
  // };
  // const options = {
  //   method: 'POST',
  //   uri: 'https://api.github.com/gists',
  //   body: JSON.stringify(body),
  //   headers: {
  //     Authorization: github.grabLocalToken(),
  //     'User-Agent': github.grabLocalLogin(),
  //   }
  // };
  // rp(options)
  //   .then(res => console.log(res))
  //   .catch(err => console.error('upload failed:', err));
}

module.exports.createGist = createGist;

function deleteGist(stats) {
  const options = {
    method: 'DELETE',
    uri: `https://api.github.com/gists/1677e545fe1616b836480ca2bc74c8b7`,
    headers: {
      'User-Agent': github.grabLocalLogin(),
    },
  };
  rp(options)
    .then(res => console.log(res))
    .catch(err => console.error('upload failed:', err));
}

module.exports.deleteGist = deleteGist;


curl -X POST -d '{"public":true,"files":{"test.txt":{"content":"String file contents"}}}' -u livrush:7583797e29ede76e50a43033d6452a9fab234d64 https://api.github.com/gists
