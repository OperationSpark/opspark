#!/usr/bin/env bash
# This installs nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash
# This sets a variable
export NVM_DIR="$HOME/.nvm"
# This loads nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# This loads nvm bash_completion
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
# This installs version 6 of node
nvm install 6
# This sets version 6 of node as the default
nvm alias default 6
# This installs global dependencies we will be using for projects
npm install --global bower watchify
echo "Great! Have fun using OpSpark!"
