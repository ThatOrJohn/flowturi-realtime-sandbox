// utils/watch.js
const WebSocket = require("ws");

// Default to localhost:8082 but allow overriding through command line args
const wsUrl = process.argv[2] || "ws://localhost:8082";

const ws = new WebSocket(wsUrl);

ws.on("open", () => console.log(`✅ Connected to ${wsUrl}`));
ws.on("message", (data) => {
  try {
    const parsed = JSON.parse(data);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.warn("⚠️ Bad message:", data.toString());
  }
});

ws.on("close", () => {
  console.log("❌ Connection closed");
  process.exit(0);
});

ws.on("error", (error) => {
  console.error("❌ Connection error:", error.message);
  process.exit(1);
});
