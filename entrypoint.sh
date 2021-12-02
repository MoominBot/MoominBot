#!/bin/sh

echo $NODE_ENV

if [ $NODE_ENV = 'production' ]; then
    yarn start
elif [ $NODE_ENV = 'staging' ]; then
    yarn build
    yarn prisma migrate deploy
else 
    yarn dev
fi