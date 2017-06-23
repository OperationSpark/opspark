var
  view = require('../view'),
  request = require('request');
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
  // fs = require('fs'),
  // url = require('url'),
  // exec = require('child_process').exec,
  // mkdirp = require('mkdirp'),
  // rimraf = require('rimraf'),
  // cancelOption = '[cancel]',
  // rootDirectory = './',
  // projectEntriesPath = 'projects/projects.json',
  // applicationDirectory = env.home() + '/opspark',
  // authFilePath = applicationDirectory + '/github',
  // userFilePath = applicationDirectory + '/user';

  // function storeCreds() {}

function greenlightRequest(hash) {
  request.post({
    url: 'https://greenlight.operationspark.org/api/os/verify',
    formData: hash,
  }, (err, res, body) => {
    if (err) {
      return console.error('upload failed:', err);
    }
    return console.log('Upload successful!  Server responded with:', body);
  });
}

function getInput() {
  view.inquireForInput('Enter the hash', (err, input) => {
    if (err) {
      console.log('There was an error!');
    }
    return greenlightRequest(input);
  });
}

module.exports = getInput;
