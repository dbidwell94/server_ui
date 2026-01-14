#!/bin/bash

# Build script for server_ui
# This script builds both the frontend and backend

set -e  # Exit on error

echo "Building server_ui..."
echo ""

# Build frontend
echo "Step 1/2: Building frontend..."
cd frontend
npm install
npm run build
cd ..
echo "✓ Frontend built successfully"
echo ""

# Build backend
echo "Step 2/2: Building Rust backend..."
cargo build --release
echo "✓ Backend built successfully"
echo ""

echo "Build complete! Run the application with:"
echo "  ./target/release/server_ui"
