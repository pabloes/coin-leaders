FROM node:22-alpine3.19

RUN apk add --no-cache chromium python3 make g++
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

WORKDIR /usr/src/app/dapp/frontend
COPY ./dapp/frontend/package.json ./dapp/frontend/package-lock.json ./
RUN npm install

WORKDIR /usr/src/app/dapp/backend
COPY ./dapp/backend/package.json ./dapp/backend/package-lock.json ./
RUN npm install

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/frontend
RUN npm run build

EXPOSE 8080

ENV NODE_ENV=production

WORKDIR /usr/src/app
CMD npm run prod