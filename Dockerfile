FROM node:10

RUN mkdir /app

RUN yarn global add firebase-tools 

WORKDIR /app/functions

ADD functions/package.json package.json
ADD functions/yarn.lock yarn.lock

RUN yarn

