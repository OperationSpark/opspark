#!/usr/bin/env bash
# Source nvm for sub-shell
. ~/.nvm/nvm.sh
# This installs version 6 of node
nvm install 6
# Switch to newest version 6
nvm use 6
# This sets version 6 of node as the default
nvm alias default 6
# This installs global dependencies we will be using for projects
npm install --global bower --depth=0 --progress

echo "Great! Have fun using OpSpark!"
