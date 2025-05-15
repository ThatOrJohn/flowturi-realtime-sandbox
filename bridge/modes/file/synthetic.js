// modes/file/synthetic.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "..", "stream.json");

let tick = 0;

function generateFakeFlow() {
  const timestamp = new Date().toISOString();
  const nodes = [
    { id: "source", label: "Source" },
    { id: "layer1a", label: "Layer 1A" },
    { id: "layer1b", label: "Layer 1B" },
    { id: "layer2a", label: "Layer 2A" },
    { id: "layer2b", label: "Layer 2B" },
    { id: "layer2c", label: "Layer 2C" },
    { id: "sink", label: "Sink" },
  ];

  const links = [
    {
      source: "source",
      target: "layer1a",
      value: Math.floor(Math.random() * 50 + 10),
    },
    {
      source: "source",
      target: "layer1b",
      value: Math.floor(Math.random() * 50 + 10),
    },
    {
      source: "layer1a",
      target: "layer2a",
      value: Math.floor(Math.random() * 30 + 5),
    },
    {
      source: "layer1a",
      target: "layer2b",
      value: Math.floor(Math.random() * 30 + 5),
    },
    {
      source: "layer1b",
      target: "layer2b",
      value: Math.floor(Math.random() * 30 + 5),
    },
    {
      source: "layer1b",
      target: "layer2c",
      value: Math.floor(Math.random() * 30 + 5),
    },
    {
      source: "layer2a",
      target: "sink",
      value: Math.floor(Math.random() * 30 + 5),
    },
    {
      source: "layer2b",
      target: "sink",
      value: Math.floor(Math.random() * 30 + 5),
    },
    {
      source: "layer2c",
      target: "sink",
      value: Math.floor(Math.random() * 30 + 5),
    },
  ];

  return { timestamp, tick, nodes, links };
}

console.log(`[synthetic] Starting data generation to ${filePath}`);
setInterval(() => {
  const data = generateFakeFlow();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`[synthetic] Tick ${tick++} written`);
}, 1000);
