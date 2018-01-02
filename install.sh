#!/usr/bin/env bash
# Save current npm version to variable, ex v6.11.2
NODE_V=`node -v`

# Check if npm version is 6
if [ ${NODE_V:1:1} != 6 ]
then
echo -e "\n\e[31mYour current version of Node is $NODE_V, which is not compatible with opspark.\n"
echo -e "Please \e[1m\e[34mupdate to (at least) Node version 6 using NVM \e[0m\e[31mand reinstall opspark.\n"
echo -e "Opspark WILL NOT WORK even if it is installed with this version of Node.\n"
pkill -9 -P $PPID
else
echo -e "\e[32mNode version good to go!"
npm install --global bower --depth=0 --progress
echo "Great! Have fun using OpSpark!"
fi
