FROM node:18

ARG MODE=file
ENV MODE=$MODE

WORKDIR /app

# Show which mode we're building for
RUN echo "Building container for MODE: $MODE"

# Install common dependencies
COPY package.json ./
RUN npm install
RUN npm install npm-run-all

# Install Kafka dependencies if in Flink mode
RUN if [ "$MODE" = "flink" ]; then \
      echo "Installing Flink mode dependencies..." && \
      npm install kafkajs axios form-data; \
    fi

# Copy all files
COPY . .

# Default command based on MODE
CMD if [ "$MODE" = "file" ]; then \
      echo "Starting in FILE mode" && \
      npm run start:file; \
    elif [ "$MODE" = "flink" ]; then \
      echo "Starting in FLINK mode" && \
      npm run start:flink; \
    else \
      echo "Invalid MODE: $MODE. Must be 'file' or 'flink'"; \
      exit 1; \
    fi