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

### Resetting the Environment

If you encounter issues with Docker networking or need to reset the environment:

```bash
# Performs a thorough reset of Docker containers, networks, and volumes
./hardcore-reset.sh
```

## Mode Differences

### File Mode Data Pattern

File mode generates a simpler data pattern with multiple layers:

- Source → Layer 1A/B → Layer 2A/B/C → Sink

### Flink Mode Data Pattern

Flink mode simulates a data pipeline pattern:

- Data Source → Processors → Analytics → Data Sink

## Troubleshooting

### Docker Network Issues

If you encounter errors related to Docker networking (e.g., "network not found"), run:

```bash
./hardcore-reset.sh
```

This script performs a complete cleanup of Docker containers, networks, and volumes related to this project.

### Switching Between Modes

When switching between modes, it's recommended to first reset the environment:

```bash
./hardcore-reset.sh
./run.sh [file|flink]
```

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
