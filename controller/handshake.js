const clc = require('cli-color');
const fs = require('fs');
const mkdirp = require('mkdirp');
const fsJson = require('fs-json')();
const rp = require('request-promise');
const greenlight = require('./greenlight');

const env = require('./env');
const view = require('../view');

const filePath = `${env.home()}/opspark`;
const URI = greenlight.URI;

function readHandshake() {
  const path = `${filePath}/handshake`;
  if (!fs.existsSync(path)) {
    return console.log('No handshake stored, run "os init-hs" to create');
  }
  return fsJson.loadSync(path);
}

// Checks if directory exists and creates if not
function checkForDirectory(path) {
  if (!fs.existsSync(path)) {
    console.log(clc.yellow('Creating new directory'));
    mkdirp.sync(path);
  }
}

// Checks if status was 200 or 400
// If 400, ends function and says to retry
// If 200, function continues
// Runs 'checkForDirectory' func for filePath and userFilePath
// Checks if file exists
// If it exists, prompts for if user wants file to be overwritten
// If it doesn't exist, creates file
function storeCreds(body, hash) {
  const path = `${filePath}/handshake`;
  const userInfo = {};
  userInfo.until = body.until;
  userInfo.hash = hash;

  if (body.status === 400) {
    console.warn('Incorrect hash, please try again.');
    return null;
  }

  checkForDirectory(filePath);

  if (fs.existsSync(path)) {
    console.log(clc.red('Hey, this file is already there!'));
    view.inquireForInput('Overwrite file? (y/n)', (err, input) => {
      console.log(input);
      if (err) {
        console.warn(clc.red('Something went wrong! Run that code again.'));
      } else if (input.toLowerCase()[0] === 'y') {
        console.warn(clc.yellow('Rewriting. . .'));
        fs.writeFileSync(path, JSON.stringify(userInfo));
        console.warn(clc.green('All done!'));
      } else {
        console.warn(clc.green('Exiting without overwrite.'));
      }
    });
  } else {
    console.warn('Writing file. . .');
    fsJson.saveSync(path, JSON.stringify(userInfo));
    console.warn(clc.green('All done!'));
  }
}

// POST request to Greenlight, runs storeCreds with response object
function greenlightRequest(hash) {
  const options = {
    method: 'POST',
    url: `${URI}/api/os/verify`,
    body: {
      authorization: hash
    },
    json: true
  };
  rp(options)
    .then(res => storeCreds(res, hash))
    .catch(err => console.error('upload failed:', err));
}

// Asks for hash from user
// Runs greenlightRequest with input hash
function getInput() {
  view.inquireForInput('Enter the hash', (err, input) => {
    if (err) {
      console.warn('There was an error!');
    }
    return greenlightRequest(input);
  });
}

module.exports = getInput;
