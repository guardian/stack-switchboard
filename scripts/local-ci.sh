#!/usr/bin/env bash

set -x

docker kill switchboard || true
docker rm switchboard || true
docker run  -d -it --name=switchboard node:10
docker cp . switchboard:/project
docker exec -w /project switchboard /project/scripts/ci.sh
docker kill switchboard
docker rm switchboard
