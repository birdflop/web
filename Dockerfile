FROM node:17.6.0

WORKDIR /home/stuff/SimplyMC

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 420

CMD [ "node", "." ]