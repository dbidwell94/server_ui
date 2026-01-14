# Quick Start Guide

## Prerequisites
- Rust (install from https://rustup.rs/)
- Node.js 18+ and npm

## Build and Run (3 commands)

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/dbidwell94/server_ui.git
cd server_ui

# 2. Build everything (frontend + backend)
./build.sh

# 3. Run the server
./target/release/server_ui
```

The server will start at http://0.0.0.0:8000

## What You Get

- A React SPA with TypeScript and Tailwind CSS
- API endpoints at `/api/*`
- Client-side routing with React Router
- Everything bundled in a single 5.6MB binary

## Try It Out

1. Open http://localhost:8000 in your browser
2. Click "About" to see React Router in action
3. Visit http://localhost:8000/api/health to see the API

## Development Mode

For local development with hot reload:

**Option 1: Recommended (Full Hot Reload)**

```bash
# Terminal 1: Start the backend API server
cargo run --features local-dev

# Terminal 2: Start the frontend dev server
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser. This provides:
- Hot module replacement for instant frontend updates
- API proxy to the backend running on port 8000
- No need to rebuild after frontend changes

**Option 2: Production-like Development**

To test the production build locally:

```bash
# Build the frontend once
cd frontend
npm run build
cd ..

# Run the backend
cargo run
```

Then open http://localhost:8000 in your browser.

The dev server will run at http://localhost:5173

Note: Build the frontend first so the `static/` directory exists.

## Project Structure

```
server_ui/
├── src/main.rs          # Rust backend
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.tsx     # Main app component
│   │   └── main.tsx    # Entry point
│   └── package.json
├── build.sh             # Build script
└── README.md           # Full documentation
```

## Next Steps

- Read `README.md` for detailed documentation
- Read `ARCHITECTURE.md` to understand the design
- Modify `frontend/src/App.tsx` to add your own pages
- Add API endpoints in `src/main.rs`
