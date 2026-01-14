#!/bin/bash

# Development helper script for server_ui
# This script helps run both the backend and frontend in development mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Server UI Development Helper${NC}"
echo ""

# Check if cargo-watch is installed
if ! command -v cargo-watch &> /dev/null; then
    echo -e "${YELLOW}cargo-watch is not installed.${NC}"
    echo "cargo-watch enables automatic backend recompilation when files change."
    echo ""
    echo "Install it with:"
    echo -e "${GREEN}  cargo install cargo-watch${NC}"
    echo ""
    read -p "Do you want to install cargo-watch now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cargo install cargo-watch
    else
        echo -e "${YELLOW}Continuing without cargo-watch (manual backend restart required)${NC}"
        echo ""
    fi
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    echo "Please install Node.js and npm first"
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
    echo ""
fi

echo -e "${GREEN}Starting development servers...${NC}"
echo ""
echo "This will start:"
echo "  1. Backend API server on http://localhost:8000 (with auto-reload)"
echo "  2. Frontend dev server on http://localhost:5173 (with HMR)"
echo ""
echo -e "${GREEN}Open http://localhost:5173 in your browser${NC}"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    jobs -p | xargs -r kill 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend with cargo-watch if available, otherwise cargo run
if command -v cargo-watch &> /dev/null; then
    echo -e "${GREEN}Starting backend with cargo-watch (auto-reload enabled)...${NC}"
    cargo-watch -x 'run --features local-dev' &
else
    echo -e "${YELLOW}Starting backend without auto-reload...${NC}"
    cargo run --features local-dev &
fi

# Give the backend a moment to start
sleep 2

# Start frontend dev server
echo -e "${GREEN}Starting frontend dev server...${NC}"
cd frontend
npm run dev

# Wait for all background jobs
wait
