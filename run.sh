#!/bin/bash

# Default mode is "file"
MODE=${1:-file}

if [ "$MODE" != "file" ] && [ "$MODE" != "flink" ]; then
  echo "Invalid mode: $MODE"
  echo "Usage: ./run.sh [file|flink]"
  exit 1
fi

echo "Starting Flowturi Realtime Sandbox in $MODE mode..."

# Make sure the stream.json exists
if [ ! -f bridge/stream.json ]; then
  echo "{}" > bridge/stream.json
fi

# Always rebuild the websocket-bridge to ensure clean environment
echo "Building the $MODE mode container..."
ENV_MODE=$MODE docker-compose --profile $MODE build websocket-bridge

# Start services with the selected profile
echo "Starting $MODE mode services..."
ENV_MODE=$MODE docker-compose --profile $MODE up

# Handle Ctrl+C gracefully
trap 'echo "Shutting down..."' INT TERM 