FROM node:10

RUN mkdir /app

RUN yarn global add firebase-tools 

WORKDIR /app/functions

ADD functions/package.json package.json
ADD functions/yarn.lock yarn.lock

EXPOSE 9005

RUN yarn
