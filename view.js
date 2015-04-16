'use strict';

var inquirer = require("inquirer");

function promptForInput(message, complete) {
    inquirer.prompt([{
        type: 'input',
        name: 'input',
        message: message}],
        function(response) {
            confirm(response.input, function(err, confirmed) {
                if (err) return promptForInput(message, complete);
                complete(null, confirmed.input);
            });
        }
    );
}
module.exports.promptForInput = promptForInput;

function confirm(input, complete) {
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
