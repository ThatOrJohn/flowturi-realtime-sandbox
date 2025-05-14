const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:8082");

ws.on("open", () => console.log("✅ Connected"));
ws.on("message", (data) => {
  try {
    const parsed = JSON.parse(data);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.warn("⚠️ Bad message:", data.toString());
  }
});
