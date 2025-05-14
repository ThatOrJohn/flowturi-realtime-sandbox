FROM node:18
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install npm-run-all
COPY bridge.js stream.json synthetic.js watch.js ./
CMD ["npm", "run", "start"]