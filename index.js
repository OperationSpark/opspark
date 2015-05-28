#! /usr/bin/env node

'use strict';

var 
    publish = require('./controller/publish'),

    config = require('./config.json'),
    appRoot = require('app-root-path'),
    init = require('./controller/init'),
    projects = require('./controller/projects'),
    janitor = require('./controller/janitor'),
    pair = require('./controller/pair'),
    program = require('commander');

program    
    .version('1.1.5');
    
program.command('pub').action(function() { publish.publish('opspark', 'fix child stderr').then(function (result) {
    console.log(result);
}); });

program    
    .command('init-pf')
    .description('Initialize your portfolio.html with the JavaScript necessary to dynamically add portfolio projects as list items to the unordered-list with the id of portfolio.')
    .action(initPortfolio);
    
program    
    .command('init-ws')
    .description('To get up and running quickly, installs a completed version of the index.html and portfolio.html files of the Operation Spark website project.')
    .action(init.website);

program
    .option('-m, --master', 'Keep master files')
    .command('install')
    .description('List installable projects.')
    .action(projects.install);
    
program
    .option('-m, --master', 'Keep master files')
    .command('pairup')
    .description('Installs a project for pair programming. The workspace owner will be asked to provide the GitHub username of their partner.')
    .action(pairup);
    
program
    .command('pairdown')
    .description('Downloads and installs a project from the GitHub Pages repository of the student with whom the using student paired. Will fail if project is already installed.')
    .action(pairdown);
    
program
    .command('fix')
    .description('Reads the projects directory, reconciles the installed projects with the projects.json file, and removes any git or svn cruft from installed projects.')
    .action(fix);

program.parse(process.argv);

// TODO : move to pair.js and call directly //
function pairup() {
    pair.up(function(err) {
        if (err) console.log(err);
    });
}

// TODO : move to pair.js and call directly //
function pairdown() {
    pair.down(function(err) {
        if (err) console.log(err);
    });
}

function initPortfolio() {
    init.portfolio();
}

function fix() {
    janitor.fix(function(err) {
        if (err) console.log(err);
    });
}
