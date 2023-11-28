FROM node:18

RUN npm install -g --force yarn

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn run build

CMD [ "yarn", "run", "start:dev" ]