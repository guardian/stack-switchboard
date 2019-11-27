#!/usr/bin/env bash

set -ex

function cleanup() {
    rm -rf dist cdk/dist
}

function build-react() {
    cd frontend
    rm -rf node_modules && yarn install
    yarn build
    cd -
}

function build-app() {
    cd app
    rm -rf node_modules && yarn install
    yarn build
    cd -
}

function build-resources() {
    cd cdk
    rm -rf node_modules && yarn install
    yarn compile
    cp -R ../dist ./
    cp -R ../frontend/build ./dist/build
    npx @guardian/node-riffraff-artifact
}

cleanup
build-react
build-app
build-resources
cleanup
