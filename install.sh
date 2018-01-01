#!/usr/bin/env bash
. ~/.nvm/nvm.sh
# This installs version 6 of node
nvm install 6
# This sets version 6 of node as the default
nvm alias default 6
# This installs global dependencies we will be using for projects
npm install --global bower watchify --depth=0 --progress

echo "Great! Have fun using OpSpark!"
