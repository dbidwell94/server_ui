# Architecture Overview

## System Design

This application demonstrates a modern full-stack architecture with a Rust backend and React frontend compiled into a single binary.

## Components

### Backend (Rust + Rocket)
- **Framework**: Rocket 0.5.1
- **Asset Embedding**: rust-embed 8.5.0
- **MIME Type Detection**: mime_guess 2.0.5
- **JSON Serialization**: serde_json 1.0

#### Key Features:
1. **Embedded Assets**: Frontend build artifacts are embedded into the binary at compile time
2. **API Routes**: All routes under `/api/*` serve backend functionality
3. **SPA Routing**: All other routes serve the React SPA's index.html
4. **Content Type Handling**: Proper MIME types for all static assets

### Frontend (React + TypeScript)
- **Framework**: React 19.2
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 4.1
- **Routing**: React Router 7.12
- **Language**: TypeScript 5.9

#### Key Features:
1. **Client-Side Routing**: React Router handles navigation without page reloads
2. **Responsive Design**: Tailwind CSS for modern UI components
3. **Type Safety**: Full TypeScript coverage
4. **Optimized Build**: Vite produces highly optimized production bundles

## Request Flow

```
Browser Request
     |
     v
Rocket Server
     |
     +---> /api/* → API Handler → JSON Response
     |
     +---> /* → Embedded index.html → React App
                                        |
                                        v
                                   React Router
                                        |
                                        v
                                   Component Rendering
```

## Build Process

```
1. Frontend Build (npm run build)
   - TypeScript compilation
   - React component bundling
   - Tailwind CSS processing
   - Asset optimization
   - Output to ../static/

2. Backend Build (cargo build --release)
   - Compile Rust source
   - Embed static/ directory contents
   - Link dependencies
   - Optimize for release
   - Output single binary

3. Result
   - Single executable (~5.6MB)
   - No runtime dependencies on static files
   - Portable across compatible platforms
```

## Deployment Advantages

1. **Single Binary**: No need to manage separate frontend and backend deployments
2. **No External Files**: All assets are embedded, eliminating file serving issues
3. **Portable**: Can run on any compatible system without additional setup
4. **Fast Startup**: No need to read files from disk at runtime
5. **Secure**: Assets cannot be modified after compilation

## Security Considerations

1. **Content Types**: Proper MIME type headers prevent content sniffing attacks
2. **Embedded Assets**: Assets are read-only and cannot be tampered with
3. **API Separation**: Clear separation between API and static content
4. **Type Safety**: TypeScript and Rust provide compile-time safety

## Performance Characteristics

1. **Memory**: Assets are loaded into memory from embedded data
2. **Startup**: Fast startup as no file I/O required for assets
3. **Response Time**: Direct memory access for static files
4. **Build Time**: ~1-2 minutes for full build from scratch

## Development Features

### Local Development Mode

The application supports a `local-dev` feature flag that changes how the backend operates:

**Without `local-dev` feature (Production Mode):**
- Static files are embedded and served from the Rust binary
- All routes (except `/api/*`) serve static assets or fallback to `index.html`
- Single binary deployment

**With `local-dev` feature (Development Mode):**
- Static file serving is disabled
- Backend only provides API endpoints
- Frontend is served by Vite dev server (port 5173) with hot module replacement
- API calls are proxied from Vite to the backend (port 8000)

### Environment Variables

The frontend supports environment-specific configuration via Vite:

- `.env.development` - Used during `npm run dev`
- `.env.production` - Used during `npm run build`
- `.env.example` - Template for environment variables

Available variables:
- `VITE_API_URL` - Backend API base URL (empty in production for same-origin)
- `VITE_DEV_SERVER_URL` - Vite dev server URL

## Static File Serving Improvements

The static file serving has been simplified:

**Before:**
- Separate routes for `/assets/*` and `/vite.svg`
- Explicit handling for specific file types
- SPA fallback on separate route

**After:**
- Single catch-all route for all static files
- Automatic MIME type detection for any file
- Tries exact file path first, falls back to `index.html`
- Supports any static file in the root directory (e.g., `vite.svg`, `favicon.ico`)

## Future Enhancements

Potential improvements for production use:
- Database integration
- Authentication/Authorization
- WebSocket support for real-time features
- Logging and monitoring
- Docker containerization
- CI/CD pipeline
