FROM node:20.15.1-alpine3.20

WORKDIR /usr/src/app

# Copying the package.json file
COPY package*.json ./

# Installing the dependencies
RUN npm install

# Copying the source code
COPY src/ ./src/

# Exposing the default topgg webhook port
EXPOSE 3000

# Running the bot
CMD ["npm", "start"]