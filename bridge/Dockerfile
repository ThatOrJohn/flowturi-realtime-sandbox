# Use Node.js base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy and install dependencies
COPY package.json ./
RUN npm install
RUN npm install npm-run-all

# Copy your bridge code and seed data
COPY bridge.js stream.json synthetic.js ./

# Start the WebSocket bridge
CMD ["npm", "run", "start"]
