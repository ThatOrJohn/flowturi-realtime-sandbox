const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "stream.json");

let tick = 0;

function generateFakeFlow() {
  const timestamp = Date.now();
  const nodes = [
    { id: "source", label: "Source" },
    { id: "stepA", label: "Step A" },
    { id: "stepB", label: "Step B" },
    { id: "sink", label: "Sink" },
  ];

  const links = [
    { source: "source", target: "stepA", value: Math.floor(Math.random() * 50 + 10) },
    { source: "stepA", target: "stepB", value: Math.floor(Math.random() * 30 + 5) },
    { source: "stepB", target: "sink", value: Math.floor(Math.random() * 20 + 3) },
  ];

  return { timestamp, tick, nodes, links };
}

setInterval(() => {
  const data = generateFakeFlow();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`[synthetic.js] Tick ${tick++} written`);
}, 1000);
