#!/bin/bash

# Emergency cleanup script to kill any lingering dev servers

echo "Killing any lingering dev servers..."

# Kill processes on the dev ports
pkill -f "cargo-watch" || true
pkill -f "cargo run" || true
pkill -f "vite" || true
pkill -f "npm run dev" || true

# Kill specific ports if they're stuck
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "Done!"
