#Sample Dockerfile for NodeJS Apps

FROM node:18

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 3500

CMD [ "node", "src/server.ts" ]
