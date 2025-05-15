console.log("[flink-bridge] Starting bridge.js in FLINK mode!!!");

const WebSocket = require("ws");
const { Kafka } = require("kafkajs");
const http = require("http");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");

// Constants
const WS_PORT = 8082;
const KAFKA_BROKER = "kafka:9092";
const KAFKA_TOPIC = "flowturi-data";
const FLINK_JOBMANAGER = "http://jobmanager:8081";

let tick = 0;
let directModeEnabled = false;

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`[flink-bridge] WebSocket server started on port ${WS_PORT}`);

// Initialize Kafka client with retry configuration
const kafka = new Kafka({
  clientId: "flowturi-bridge",
  brokers: [KAFKA_BROKER],
  retry: {
    initialRetryTime: 1000,
    retries: 5,
  },
});

const consumer = kafka.consumer({ groupId: "flowturi-bridge-group" });

// Function to deploy the Flink job if not already deployed
async function ensureFlinkJobDeployed() {
  try {
    console.log("[flink-bridge] Checking if Flink job is already deployed...");

    // Deploy the Flink job to generate data
    const jarPath = path.join(__dirname, "flink-flowturi-job.jar");

    // First, check if the jar file exists
    if (!fs.existsSync(jarPath)) {
      console.log(
        "[flink-bridge] Flink job JAR not found, falling back to synthetic data generation"
      );
      return false;
    }

    try {
      // Check if any jobs are running
      const jobsResponse = await axios.get(`${FLINK_JOBMANAGER}/jobs`);
      const runningJobs = jobsResponse.data.jobs.filter(
        (job) =>
          job.status === "RUNNING" &&
          job.name === "Flowturi Synthetic Data Generator"
      );

      if (runningJobs.length > 0) {
        console.log("[flink-bridge] Flink job is already running");
        return true;
      }

      console.log("[flink-bridge] Deploying Flink job...");

      // If no job is running, deploy the jar
      const formData = new FormData();
      formData.append("jarfile", fs.createReadStream(jarPath));

      await axios.post(`${FLINK_JOBMANAGER}/jars/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("[flink-bridge] Successfully deployed Flink job");
      return true;
    } catch (error) {
      console.error("[flink-bridge] Error connecting to Flink:", error.message);
      return false;
    }
  } catch (error) {
    console.error("[flink-bridge] Error deploying Flink job:", error.message);
    return false;
  }
}

// Function to start Kafka-based synthetic data generation
async function startKafkaSyntheticDataGeneration() {
  try {
    const producer = kafka.producer();
    await producer.connect();
    console.log(
      "[flink-bridge] Connected to Kafka for synthetic data generation"
    );

    setInterval(async () => {
      const data = generateSyntheticData();

      try {
        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [{ value: JSON.stringify(data) }],
        });

        console.log(
          `[flink-bridge] Generated and sent synthetic data to Kafka: tick ${data.tick}`
        );
      } catch (error) {
        console.error("[flink-bridge] Error sending to Kafka:", error.message);
        // If we have issues sending to Kafka, switch to direct mode
        if (!directModeEnabled) {
          console.log("[flink-bridge] Switching to direct WebSocket mode");
          directModeEnabled = true;
          startDirectSyntheticDataGeneration();
        }
      }
    }, 1000);

    return true;
  } catch (error) {
    console.error("[flink-bridge] Failed to connect to Kafka:", error.message);
    return false;
  }
}

// Function to directly send synthetic data via WebSocket without Kafka
function startDirectSyntheticDataGeneration() {
  console.log(
    "[flink-bridge] Starting direct synthetic data generation via WebSocket"
  );

  setInterval(() => {
    const data = generateSyntheticData();

    // Broadcast directly to WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });

    console.log(
      `[flink-bridge] Generated and sent direct synthetic data: tick ${data.tick}`
    );
  }, 1000);
}

// Generate synthetic data with Flink pattern
function generateSyntheticData() {
  const timestamp = new Date().toISOString();

  // Create a simplified structure with a single source, two intermediate layers, and a sink
  const nodes = [
    { id: "data_source", label: "Data Source" },
    { id: "processor_1", label: "Processor 1" },
    { id: "processor_2", label: "Processor 2" },
    { id: "analytics_1", label: "Analytics 1" },
    { id: "analytics_2", label: "Analytics 2" },
    { id: "data_sink", label: "Data Sink" },
  ];

  // Generate random values with some simulated patterns
  // Adjust min and max values to create interesting variations
  const sourceToProc1 = Math.floor(Math.random() * 40 + 30); // 30-70
  const sourceToProc2 = Math.floor(Math.random() * 30 + 20); // 20-50

  const proc1ToAnalytics1 = Math.floor(
    sourceToProc1 * (Math.random() * 0.3 + 0.6)
  ); // 60-90% of input
  const proc1ToAnalytics2 = sourceToProc1 - proc1ToAnalytics1; // Remainder

  const proc2ToAnalytics1 = Math.floor(
    sourceToProc2 * (Math.random() * 0.4 + 0.3)
  ); // 30-70% of input
  const proc2ToAnalytics2 = sourceToProc2 - proc2ToAnalytics1; // Remainder

  const analytics1ToSink = proc1ToAnalytics1 + proc2ToAnalytics1;
  const analytics2ToSink = proc1ToAnalytics2 + proc2ToAnalytics2;

  const links = [
    { source: "data_source", target: "processor_1", value: sourceToProc1 },
    { source: "data_source", target: "processor_2", value: sourceToProc2 },
    { source: "processor_1", target: "analytics_1", value: proc1ToAnalytics1 },
    { source: "processor_1", target: "analytics_2", value: proc1ToAnalytics2 },
    { source: "processor_2", target: "analytics_1", value: proc2ToAnalytics1 },
    { source: "processor_2", target: "analytics_2", value: proc2ToAnalytics2 },
    { source: "analytics_1", target: "data_sink", value: analytics1ToSink },
    { source: "analytics_2", target: "data_sink", value: analytics2ToSink },
  ];

  return { timestamp, tick: tick++, nodes, links };
}

// Connect to Kafka and consume messages
async function connectToKafka() {
  try {
    await consumer.connect();
    console.log("[flink-bridge] Connected to Kafka consumer");

    // Subscribe to the Flowturi data topic
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: false });
    console.log(`[flink-bridge] Subscribed to Kafka topic: ${KAFKA_TOPIC}`);

    // Run the consumer to process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = message.value.toString();

          // Broadcast the message to all connected WebSocket clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(data);
            }
          });

          const parsedData = JSON.parse(data);
          console.log(
            `[flink-bridge] Received and broadcast data from Kafka: tick ${parsedData.tick}`
          );
        } catch (error) {
          console.error(
            "[flink-bridge] Error processing Kafka message:",
            error.message
          );
        }
      },
    });
    return true;
  } catch (error) {
    console.error(
      "[flink-bridge] Kafka consumer connection error:",
      error.message
    );
    return false;
  }
}

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("[flink-bridge] WebSocket client connected");

  ws.on("close", () => {
    console.log("[flink-bridge] WebSocket client disconnected");
  });
});

// Main startup function
async function startup() {
  console.log("[flink-bridge] Starting Flink bridge...");

  // Try to ensure Flink job is deployed
  const flinkDeployed = await ensureFlinkJobDeployed();

  // Try to connect to Kafka as a consumer
  const kafkaConnected = await connectToKafka();

  // If we couldn't connect to Kafka as a consumer, try to generate synthetic data via Kafka
  if (!kafkaConnected) {
    const kafkaProducerStarted = await startKafkaSyntheticDataGeneration();

    // If we couldn't connect to Kafka at all, fall back to direct WebSocket mode
    if (!kafkaProducerStarted) {
      startDirectSyntheticDataGeneration();
    }
  } else if (!flinkDeployed) {
    // If we connected to Kafka but couldn't deploy a Flink job, start generating synthetic data through Kafka
    await startKafkaSyntheticDataGeneration();
  }
}

// Start the bridge
startup().catch((error) => {
  console.error("[flink-bridge] Startup error:", error);
  console.log(
    "[flink-bridge] Falling back to direct WebSocket mode due to startup error"
  );
  startDirectSyntheticDataGeneration();
});
