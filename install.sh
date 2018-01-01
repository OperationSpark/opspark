#!/usr/bin/env bash
# Save current npm version to variable
NODE_V=`node -v`
echo $NODE_V
# Check if npm version is 6
if [ ${NODE_V:1:1} != 6 ]
then
echo "Must update Node version. . ."
# This installs global dependencies we will be using for projects
npm install --global bower --depth=0 --progress
# Source nvm for sub-shell
. ~/.nvm/nvm.sh
# Save current npm version to variable
NVM_CURRENT=`nvm current`
echo $NVM_CURRENT
# This installs version 6 of node
nvm install 6 
# Switch to newest version 6
nvm use 6
# This sets version 6 of node as the default
nvm alias default 6
# Reinstall packages from where they just were to v6
nvm reinstall-packages ${NVM_CURRENT:1}

else

echo "Node version good to go!"

npm install --global bower --depth=0 --progress

fi

echo "Great! Have fun using OpSpark!"
