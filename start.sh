#!/bin/bash
set -e

# Build the Java backend
echo "Building Java backend..."
mvn clean package

# Start the Java backend in background (CORRECT JAR)
echo "Starting Java backend..."
java -jar target/n2n-1.0-SNAPSHOT-shaded.jar &
BACKEND_PID=$!

# Wait for backend
echo "Waiting for backend to start..."
sleep 5

# Frontend directory
FRONTEND_DIR="n2n-ui"

# Install frontend dependencies if missing
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$FRONTEND_DIR"
  npm install
  cd ..
fi

# Start frontend
echo "Starting frontend..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to exit
wait $FRONTEND_PID

# Stop backend when frontend stops
echo "Stopping backend (PID: $BACKEND_PID)..."
kill $BACKEND_PID
