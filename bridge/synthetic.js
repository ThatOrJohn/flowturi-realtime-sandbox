// synthetic.js

const fs = require('fs');
const path = require('path');

const streamPath = path.join(\_\_dirname, 'stream.json');
let tick = 0;

function generateSyntheticPayload() {
const now = Date.now();
tick++;

const nodes = \[];
const links = \[];

// Layer 1: 2 source nodes
for (let i = 0; i < 2; i++) {
nodes.push({ id: `L1-${i}`, name: `Source ${i}`, layer: 1 });
}

// Layer 2: 1 intermediate node
nodes.push({ id: 'L2-0', name: 'Aggregator', layer: 2 });

// Layer 3: 3 intermediate nodes
for (let i = 0; i < 3; i++) {
nodes.push({ id: `L3-${i}`, name: `Stage 3.${i}`, layer: 3 });
}

// Layer 4: 4 terminal nodes
for (let i = 0; i < 4; i++) {
nodes.push({ id: `L4-${i}`, name: `Final ${i}`, layer: 4 });
}

// Links from Layer 1 to Layer 2
for (let i = 0; i < 2; i++) {
links.push({ source: `L1-${i}`, target: 'L2-0', value: randomFlow() });
}

// Links from Layer 2 to Layer 3
for (let i = 0; i < 3; i++) {
links.push({ source: 'L2-0', target: `L3-${i}`, value: randomFlow() });
}

// Links from Layer 3 to Layer 4
for (let i = 0; i < 3; i++) {
const l3 = `L3-${i}`;
const numTargets = Math.floor(Math.random() \* 2) + 1; // each connects to 1–2 L4s
const targets = shuffle(\[0, 1, 2, 3]).slice(0, numTargets);
for (const t of targets) {
links.push({ source: l3, target: `L4-${t}`, value: randomFlow() });
}
}

return { timestamp: now, tick, nodes, links };
}

function randomFlow() {
return Math.floor(Math.random() \* 20) + 5;
}

function shuffle(array) {
return array.sort(() => Math.random() - 0.5);
}

function write() {
const payload = generateSyntheticPayload();
fs.writeFileSync(streamPath, JSON.stringify(payload, null, 2));
}

setInterval(write, 500);
