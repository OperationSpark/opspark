require('colors');
const exec = require('child_process').exec;

const janitor = require('./janitor');
const github = require('./github');
const greenlight = require('./greenlight');
const sessions = require('./sessions');
const projects = require('./projects');
const test = require('./test');
const { createGistHelper, deleteGistHelper, readGistHelper } = require('./helpers');

function submit() {
  console.log('Beginning submit process!'.blue);
  projects.action = 'submit';
  github.getCredentials()
    .catch(janitor.error('Failure getting credentials'.red))
    .then(greenlight.getSessions)
    .catch(janitor.error('Failure getting sessions'.red))
    .then(sessions.selectSession)
    .catch(janitor.error('Failure selecting session'.red))
    .then(projects.selectProject)
    .catch(janitor.error('Failure selecting project'.red))
    .then(test.grabTests)
    .catch(janitor.error('Failure grabbing tests'.red))
    .then(test.runTests)
    .catch(janitor.error('Failure running tests'.red))
    .then(checkGrade)
    .catch(janitor.error('Failure checking grade'.red))
    .then(createGist)
    .catch(janitor.error('Failure creating gist'.red))
    .then(ensureGistExists)
    .catch(janitor.error('Failure ensuring gist exists'.red))
    .then(greenlight.sendGrade)
    .catch(janitor.error('Failure grading project'.red))
    .then(deleteGist)
    .catch(janitor.error('Failure deleting gist'.red))
    .then(() => console.log('Successfully concluded submission.'.blue))
    .catch((err) => { console.error(err); });
}

module.exports.submit = submit;

function checkGrade({ project, parsedStdout }) {
  const stats = parsedStdout.stats;
  return new Promise(function (res, rej) {
    if (stats.passes < (stats.tests / 2)) {
      rej(`You have not passed all tests for ${project.name}! Must be have finished at least 50% to submit. Canceling submit.`.red);
    } else {
      console.log('Great!'.green, 'Beginning the upload process. . .'.yellow);
      res({ project, stats });
    }
  });
}

module.exports.checkGrade = checkGrade;

function createGist({ project, stats }) {
  const files = {
    id: github.grabLocalUserID(),
    requirementId: project._id,
    sessionId: project._session,
    type: 'PROJECT',
    tests: stats.tests,
    passes: stats.passes,
    failures: stats.failures,
  };

  let content = {
    public: true,
    description: 'Project results',
    files: {
      'grade.txt': {
        content: JSON.stringify(files),
      }
    }
  };

  content = JSON.stringify(content);
  return new Promise(function (res, rej) {
    console.log('Creating gist. . .'.yellow);
    const cmd = createGistHelper(content, github.grabLocalLogin(), github.grabLocalAuthToken());
    exec(cmd, function (err, stdout, stderr) {
      const gist = JSON.parse(stdout);
      if (err) rej(err);
      console.log('Gist created!'.green);
      res({ project, gist, tries: 1 });
    });
  });
}

module.exports.createGist = createGist;

function ensureGistExists({ project, gist, tries }) {
  return new Promise(function (res, rej) {
    if (tries < 4) {
      console.log(`Ensuring gist exists. . . Attempt ${tries}`.yellow);
      const cmd = readGistHelper(gist.files['grade.txt'].raw_url);
      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          rej(err);
        } else if (stdout === '404: Not Found') {
          res(ensureGistExists({ project, gist, tries: tries + 1 }));
        } else {
          res({ project, gist });
        }
      });
    } else {
      rej('There was an issue with your gist. Please try submitting again!');
    }
  });
}

function deleteGist(url) {
  return new Promise(function (res, rej) {
    console.log('Deleting gist. . .'.yellow);
    const cmd = deleteGistHelper(github.grabLocalLogin(), github.grabLocalAuthToken(), url);
    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        rej(err);
      }
      console.log('Gist deleted!'.green);
      res(url);
    });
  });
}

module.exports.deleteGist = deleteGist;
