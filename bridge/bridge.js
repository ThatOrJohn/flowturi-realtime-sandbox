// bridge.js
const fs = require('fs');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8082 });
wss.on('connection', ws => {
  console.log('Client connected');
});

fs.watchFile('stream.json', () => {
  const data = fs.readFileSync('stream.json', 'utf-8');
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
});
