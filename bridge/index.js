// index.js - Main entry point that delegates to the appropriate mode
const path = require("path");
const fs = require("fs");

// Get the mode from environment variable, defaulting to "file"
const mode = process.env.MODE || "file";

console.log(`Starting in ${mode.toUpperCase()} mode`);

// Ensure required directories exist
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, "modes", "file"),
    path.join(__dirname, "modes", "flink"),
    path.join(__dirname, "utils"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Ensure output file exists for file mode
const ensureOutputFile = () => {
  const streamFile = path.join(__dirname, "stream.json");
  if (!fs.existsSync(streamFile)) {
    fs.writeFileSync(streamFile, "{}", "utf8");
    console.log(`Created empty stream.json file`);
  }
};

// Main function
(async () => {
  ensureDirectories();
  ensureOutputFile();

  try {
    if (mode === "file") {
      // For file mode, the npm script handles starting both processes
      console.log(
        "File mode is handled by npm scripts. This file should not be run directly in file mode."
      );
    } else if (mode === "flink") {
      // For Flink mode, load the Flink bridge
      require("./modes/flink/bridge");
    } else {
      console.error(`Invalid mode: ${mode}. Must be 'file' or 'flink'`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error starting in ${mode} mode:`, error);
    process.exit(1);
  }
})();
