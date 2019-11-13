#!/usr/bin/env bash

set -ex

function cleanup() {
    rm -rf node_modules dist cdk/node_modules
}

function build-app() {
    npm install
    npm run build
}

function build-resources() {
    cd cdk
    npm install
    npm run compile
    cp -R ../dist ./
    npx @guardian/node-riffraff-artifact
}

cleanup
build-app
build-resources