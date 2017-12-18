#!/usr/bin/env bash

# This installs version 6 of node
nvm install 6
# This sets version 6 of node as the default
nvm alias default 6
# This installs global dependencies we will be using for projects
npm install --global bower watchify

echo "Great! Have fun using OpSpark!"
