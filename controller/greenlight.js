'use strict';

require('colors');
const rp = require('request-promise');

const github = require('./github');

// TODO: Switch URI for live version
const LOCALHOST = 'http://localhost:3000';
const GREENLIGHT = 'https://greenlight.operationspark.org';
const URI = LOCALHOST;

module.exports.URI = URI;

function getSessions({ id }) {
  console.log('Grabbing enrolled sessions. . .'.yellow);
  const options = {
    method: 'GET',
    uri: `${URI}/api/os/install`,
    qs: {
      id,
    },
  };
  return rp(options);
}

module.exports.getSessions = getSessions;

function sendGrade({ gist, project }) {
  const body = {
    id: github.grabLocalUserID().toString(),
    requirementId: project._id,
    sessionId: project._session,
    url: gist.files['grade.txt'].raw_url,
  };

  const options = {
    body,
    method: 'POST',
    uri: `${URI}/api/os/grade`,
    json: true,
  };

  return rp(options)
    .then((response) => {
      if (response.status === 200) {
        console.log(response.message.blue);
      } else {
        console.log(response.reason.red);
        console.log(response.details.red);
      }
      return gist.url;
    });
}

module.exports.grade = grade;
