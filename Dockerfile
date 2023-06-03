#FROM node:16-alpine
FROM jrottenberg/ffmpeg:4.1-alpine as ffmpeg
FROM node:lts-alpine

COPY --from=ffmpeg / /

WORKDIR /home/node/app
COPY package*.json ./
RUN npm install

COPY ./index.js ./
COPY ./Utils.js ./

EXPOSE 8080

CMD ["node", "index.js"];
