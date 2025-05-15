// modes/file/bridge.js
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const streamFile = path.join(__dirname, "..", "..", "stream.json");

const wss = new WebSocket.Server({ port: 8082 });
wss.on("connection", (ws) => {
  console.log("Client connected to file mode bridge");
});

fs.watchFile(streamFile, () => {
  try {
    const data = fs.readFileSync(streamFile, "utf-8");
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
    console.log(`[file-bridge] Sent update to ${wss.clients.size} clients`);
  } catch (error) {
    console.error("Error reading stream file:", error);
  }
});

console.log(`[file-bridge] Started WebSocket server on port 8082`);
console.log(`[file-bridge] Watching for changes in ${streamFile}`);
