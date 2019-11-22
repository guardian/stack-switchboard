#!/usr/bin/env bash

set -ex

function cleanup() {
    rm -rf node_modules dist cdk/node_modules
}

function build-react() {
    cd frontend
    yarn install
    yarn build
    cd -
}

function build-app() {
    cd app
    yarn install
    yarn build
    cd -
}

function build-resources() {
    cd cdk
    rm -rf node_modules && yarn install
    yarn compile
    cp -R ../dist ./
    mkdir ./dist/prod/
    cp -R ../frontend/build ./dist/prod/build
    ls -al dist/
    npx @guardian/node-riffraff-artifact
}

cleanup
build-react
build-app
build-resources