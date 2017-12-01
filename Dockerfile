FROM mhart/alpine-node:8

WORKDIR /opt/app

COPY . .

RUN npm install --production
CMD npm start
