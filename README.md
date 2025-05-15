# Flowturi Real-Time Sandbox

This project provides a sandbox environment to generate synthetic demo data for [Flowturi Studio](https://github.com/ThatOrJohn/flowturi) - a visualization tool for Sankey diagrams with real-time capabilities.

## Overview

The sandbox supports two modes of operation:

1. **File Mode (`MODE=file`)**: Uses simple Node.js scripts to generate synthetic data and serve it via WebSocket.
2. **Flink Mode (`MODE=flink`)**: Uses Apache Flink and Kafka to generate more realistic streaming data patterns.

Both modes produce data compatible with Flowturi's Real-Time WebSocket connection feature.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Setup

Clone this repository:

```bash
git clone https://github.com/ThatOrJohn/flowturi-realtime-sandbox.git
cd flowturi-realtime-sandbox
```

### Running the Sandbox

The project provides a simple script to start in either mode:

```bash
# Run in file mode (default)
./run.sh file

# Run in Flink mode
./run.sh flink
```

### Connecting to the Sandbox

Once the sandbox is running, connect Flowturi Studio to:

```
ws://localhost:8082
```

## Mode Differences

### File Mode Data Pattern

File mode generates a simpler data pattern with multiple layers:

- Source → Layer 1A/B → Layer 2A/B/C → Sink

### Flink Mode Data Pattern

Flink mode simulates a data pipeline pattern:

- Data Source → Processors → Analytics → Data Sink

## Development

The project is organized as follows:

```
.
├── bridge/                # The bridge server code
│   ├── modes/             # Mode-specific implementations
│   │   ├── file/          # File mode implementation
│   │   └── flink/         # Flink mode implementation
│   └── utils/             # Shared utilities
├── docker-compose.yml     # Docker Compose configuration
├── run.sh                 # Script to run the sandbox
```

### Customizing the Data

- To modify the file mode data, edit `bridge/modes/file/synthetic.js`
- To modify the Flink mode data, edit `bridge/modes/flink/bridge.js`

## License

MIT
