#!/usr/bin/env bash

set -ex


npm install
npm install -g @zeit/ncc
npm install -g aws-cdk

npm run build

cd cdk
npm install
npm run compile
cp -R ../dist ./

npx @guardian/node-riffraff-artifact