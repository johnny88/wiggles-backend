FROM node:8

RUN yarn global add firebase-tools

RUN mkdir /app
WORKDIR /app
RUN mkdir functions

ADD functions/package.json functions/package.json
ADD functions/yarn.lock functions/yarn.lock

RUN cd functions && yarn
