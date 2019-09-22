FROM node:10

EXPOSE 9005
RUN mkdir /app

RUN yarn global add firebase-tools 

WORKDIR /app/functions

ADD functions/package.json package.json
ADD functions/yarn.lock yarn.lock
RUN yarn
