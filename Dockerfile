FROM node:23.3.0

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:dev" ]