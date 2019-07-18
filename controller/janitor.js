require('colors');
const fs = require('fs');
const _ = require('lodash');
const env = require('./env');
const projects = require('./projects');
<<<<<<< HEAD
const githubMatch = /[\w]+\.github\.io/;
const githubDir = fs.readdirSync(`${env.home()}/environment`).filter(path => githubMatch.test(path))[0];
const root = `${env.home()}/environment`;
const projectsDirectory = `${root}/${githubDir}/projects`;
=======

const root = `${env.home()}/environment`;
const projectsDirectory = `${root}/projects`;
>>>>>>> 5665ea33d85f34b70b019f722b0e64bdd30425e3

module.exports.error = function (message) {
  return function (error) {
    console.error(message);
    throw new Error(error);
  };
};

module.exports.fix = function (complete) {
  if (!fs.existsSync(projectsDirectory)) return complete(new Error('No projects installed, aborting fix, install some projects first by running "os install"'));

  projects.list(function (err, list) {
    fs.readdir(projectsDirectory, function (err, files) {
      if (err) return complete(err);

      // For every file in the list //
      files.forEach(function (file) {
        console.log('Checking project %s, please wait...'.green, file);
        const path = `${projectsDirectory}/${file}`;
        fs.stat(path, function (err, stat) {
          if (err) return complete(err);
          if (stat && stat.isDirectory()) {
            if (!fs.existsSync(path + '/index.html')) {
              return console.log('No index.html file found in %s, possibly not a valid Operation Spark project or somethings outta wack, check it out manually. Skipping...'.green, path);
            }
            const project = _.filter(list, { name: file })[0];
            if (project) {
              projects.initializeProject(project, null, path, function () {
                console.log('All done checking project %s!'.green, project.name);
              });
            }
          } else {
            console.log('%s is not a recognized project, skipping file...'.green, file);
          }
        });
      });
    });
  });
};
