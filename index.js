#! /usr/bin/env node

'use strict';

var 
    config = require('./config.json'),
    appRoot = require('app-root-path'),
    init = require('./controller/init'),
    projects = require('./controller/projects'),
    program = require('commander');

program    
    .version('0.0.1');

program    
    .command('init-pf')
    .description('Initialize your portfolio.html with the JavaScript necessary to dynamically add portfolio projects as list items to the unordered-list with the id of portfolio.')
    .action(init.portfolio);
    
program    
    .command('init-ws')
    .description('To get up and running quickly, installs a completed version of the index.html and portfolio.html files of the Operation Spark website project.')
    .action(init.website);

program
    .option('-m, --master', 'Keep master files')
    .command('install')
    .description('List installable projects.')
    .action(projects.list);

program.parse(process.argv);
