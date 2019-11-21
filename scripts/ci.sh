#!/usr/bin/env bash

set -ex

function cleanup() {
    rm -rf node_modules dist cdk/node_modules
}

function build-react() {
    cd frontend
    npm run build
    cp -R build ../app/
    cd -
}

function build-app() {
    cd app
    npm install
    npm run build
    cd -
}

function build-resources() {
    cd cdk
    npm install
    npm run compile
    cp -R ../dist ./
    npx @guardian/node-riffraff-artifact
}

cleanup
build-react
build-app
build-resources