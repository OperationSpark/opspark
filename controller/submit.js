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
  const cmd = `curl -X POST -d '{"public":true,"files":{"grade.txt":{"content":"heyheyhey"}}}' -u ${github.grabLocalLogin()}:${github.grabLocalToken()} https://api.github.com/gists`;

  console.log(cmd);

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
    console.log(stdout);
  });

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
  const id = '6c2b7ea354a19c571b8f180949f4ecae'

  const cmd = `curl -X DELETE -u ${github.grabLocalLogin()}:${github.grabLocalToken()} https://api.github.com/gists/${id}`

  console.log(cmd);

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
    console.log(stdout);
  });
  // const options = {
  //   method: 'DELETE',
  //   uri: `https://api.github.com/gists/1677e545fe1616b836480ca2bc74c8b7`,
  //   headers: {
  //     'User-Agent': github.grabLocalLogin(),
  //   },
  // };
  // rp(options)
  //   .then(res => console.log(res))
  //   .catch(err => console.error('upload failed:', err));
}

module.exports.deleteGist = deleteGist;
