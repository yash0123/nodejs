FROM node:17

WORKDIR /index

COPY package*.json ./

RUN npm install

COPY . .

RUN npm index.js

EXPOSE 1337

CMD ["node" , "app.js"]
