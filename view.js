'use strict';

var 
    Promise = require("bluebird"),
    Q = require("bluebird-q"),
    util = require('util'),
    inquirer = require('inquirer'),
    prompt = require('prompt');

function inquireForInput(message, complete) {
    inquirer.prompt([{
        type: 'input',
        name: 'input',
        message: message}],
        function(response) {
            confirmInquire(response.input, function(err, confirmed) {
                if (err) return inquireForInput(message, complete);
                complete(null, confirmed.input);
            });
        }
    );
}
module.exports.inquireForInput = inquireForInput;

function confirmInquire(input, complete) {
    inquirer.prompt([{
        type: 'confirm', 
        name: 'confirmed', 
        message: "Your input was '" + input + "': All good?", 
        default: true}],
        function(response) {
            if (!response.confirmed) return complete({response: 'unconfirmed', input: input});
            return complete(null, {input: input});
        });
}

function promptForInput(message, validator, invalidMessage) {
    return prmpt(message, validator, invalidMessage)
        .then(confirm)
        .catch(UserCancelledError, function() {
            return promptForInput(message, validator, invalidMessage);
        });
}
module.exports.promptForInput = promptForInput;


function prmpt(message, validator, invalidMessage) {
    prompt.message = '';
    prompt.delimiter = '';
    prompt.start();
    
    var schema = {
        properties: {
            input: {
                description: message,
                pattern: validator,
                message: invalidMessage,
                required: true
            }
        }
    };
    
    return new Promise(function(resolve, reject) {
        prompt.get(schema, function (err, result) {
            if (err) return reject(err);
            resolve(result.input);
        });
    });
}

function confirm(input) {
    var schema = {
        properties: {
            confirm: {
                description: util.format('Your input was %s: All good? (Y/n)', input),
                pattern: /Y|n/,
                message: 'Enter capital Y for yes, lowercase n for no',
                required: true
            }
        }
    };
    return new Promise(function(resolve, reject) {
        prompt.get(schema, function (err, result) {
            if (err) return reject(err);
            if (result.confirm === 'Y') {
                resolve(input);
            } else {
                reject(new UserCancelledError());
            }
        });
    });
}

function UserCancelledError(message) {
    this.name = "UserCancelledError";
    this.message = (message || "The user cancelled the input operation");
}
UserCancelledError.prototype = new Error();