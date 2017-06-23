var
  view = require('../view'),
  request = require('request'),
	// config = require('../config'),
  // _ = require('lodash'),
  // util = require('util'),
  // Q = require('q'),
  // fsJson = require('fs-json')(),
  // changeCase = require('change-case'),
  // async = require('async'),
  // github = require('./github'),
  // program = require('commander'),
  // inquirer = require('inquirer'),
  // colors = require('colors'),
  fs = require('fs'),
  // url = require('url'),
  // exec = require('child_process').exec,
  mkdirp = require('mkdirp'),
  // rimraf = require('rimraf'),
  // cancelOption = '[cancel]',
  // rootDirectory = './',
  // projectEntriesPath = 'projects/projects.json',
  colors = require('colors'),
  env = require('./env'),
  applicationDirectory = `${env.home()}/opspark`,
  authFilePath = `${applicationDirectory}/github`,
  userFilePath = `${applicationDirectory}/user`;

function storeCreds(body) {
  const path = `${userFilePath}/user.json`;

  if (!fs.existsSync(applicationDirectory)) {
    console.log(colors.yellow('Creating new app directory'));
    mkdirp.sync(applicationDirectory);
  }

  if (!fs.existsSync(userFilePath)) {
    console.log(colors.yellow('Creating new user directory'));
    mkdirp.sync(userFilePath);
  }

  if (fs.existsSync(path)) {
    console.log(colors.red('Hey, this file already there!'));
    view.inquireForInput('Overwrite file?', (err, input) => {
      console.log(input);
      if (err) {
        console.warn(colors.red('Something went wrong! Run that code again.'));
      } else if (input.toLowerCase()[0] === 'y') {
        console.warn(colors.yellow('Rewriting. . .'));
        fs.writeFileSync(path, body);
      } else {
        console.warn(colors.green('All done!'));
      }
    });
  } else {
    fs.writeFileSync(path, body);
    console.warn(colors.green('All done!'));
  }
}

function greenlightRequest(hash) {
  const options = {
    url: 'https://greenlight.operationspark.org/api/os/verify',
    formData: hash,
  };
  request.post(options, (err, res, body) => {
    if (err) {
      return console.error('upload failed:', err);
    }
    return storeCreds(body);
  });
}

function getInput() {
  console.warn(applicationDirectory);
  console.warn(authFilePath);
  console.warn(userFilePath);
  view.inquireForInput('Enter the hash', (err, input) => {
    if (err) {
      console.warn('There was an error!');
    }
    return greenlightRequest(input);
  });
}

module.exports = getInput;

getInput();
