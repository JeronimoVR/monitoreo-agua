FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

COPY src/common/mail/templates ./dist/common/mail/templates

EXPOSE 3001

CMD ["npm", "run", "start"]