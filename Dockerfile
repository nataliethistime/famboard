FROM node:14
MAINTAINER Nathan McCallum <hello@nathan-mccallum.com>

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install
