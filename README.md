# server_ui
Seamlessly manage your headless Steam server remotely

## Overview

This project is a full-stack web application built with:
- **Backend**: Rust with Rocket framework
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, and React Router
- **Deployment**: Single binary with embedded frontend assets

The backend serves the React SPA and provides API endpoints under `/api/*`. The frontend is built into static files and embedded directly into the Rust binary using `rust-embed`, making the application portable as a single executable.

## Prerequisites

- Rust (latest stable version)
- Node.js 18+ and npm
- cargo (comes with Rust)

## Building the Application

### 1. Build the Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

This will build the React frontend and output the static files to the `static/` directory in the project root.

### 2. Build the Backend

```bash
cargo build --release
```

This compiles the Rust backend and embeds the static frontend files into the binary.

### 3. Run the Application

```bash
./target/release/server_ui
```

The server will start at `http://127.0.0.1:8000`

## API Endpoints

- `GET /api/health` - Health check endpoint that returns JSON status

## Frontend Routes

- `/` - Home page
- `/about` - About page
- All other routes fallback to the SPA (React Router handles client-side routing)

## Development

### Local Development (Recommended)

For the best development experience, run the frontend and backend separately:

1. **Start the backend in local-dev mode:**
   ```bash
   cargo run --features local-dev
   ```
   This runs the backend API on `http://localhost:8000` without serving static files.

2. **Start the frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```
   This starts Vite's dev server on `http://localhost:5173` with hot module replacement.

3. **Access the application:**
   Open `http://localhost:5173` in your browser. API calls to `/api/*` will be automatically proxied to the backend.

### Alternative: Production-like Development

To test the production build locally:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Run the backend (without local-dev feature):**
   ```bash
   cargo run
   ```

3. **Access the application:**
   Open `http://localhost:8000` in your browser.

## Architecture

The application uses the following architecture:

1. **Frontend Build**: Vite builds the React app into optimized static files (HTML, CSS, JS)
2. **Asset Embedding**: The `rust-embed` crate embeds these static files into the Rust binary at compile time
3. **Routing**:
   - `/api/*` routes are handled by Rocket endpoints
   - All other routes serve the React SPA's `index.html`, allowing React Router to handle client-side routing
4. **Single Binary**: The result is a single executable that contains both the backend logic and frontend assets

## Project Structure

```
.
├── Cargo.toml              # Rust dependencies
├── src/
│   └── main.rs             # Rocket server with embedded assets
├── frontend/
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.ts      # Vite configuration (builds to ../static)
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── src/
│       ├── main.tsx        # React entry point with Router
│       ├── App.tsx         # Main app component with routes
│       └── index.css       # Tailwind directives
└── static/                 # Build output (gitignored, embedded at compile time)
```
