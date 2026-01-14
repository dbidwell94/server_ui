# Frontend - React + TypeScript + Vite + Tailwind

This is the frontend for the server_ui project, built with React, TypeScript, Vite, and Tailwind CSS.

## Development

### Quick Start

From the project root, run:
```bash
./dev.sh
```

Or manually from this directory:
```bash
npm install
npm run dev
```

The dev server will start at http://localhost:5173 with hot module replacement.

### Environment Variables

The frontend uses Vite's environment variable system. Variables are loaded from:
- `.env.development` - Used during `npm run dev`
- `.env.production` - Used during `npm run build`

**Available Variables:**
- `VITE_DEV_SERVER_URL` - The Vite dev server URL (default: http://localhost:5173)
- `VITE_API_URL` - The backend API URL
  - Development: http://localhost:8000
  - Production: empty (same origin)

Access these in your code with `import.meta.env.VITE_*`:
```typescript
const apiUrl = import.meta.env.VITE_API_URL || '';
```

### API Proxy

In development mode, Vite is configured to proxy `/api/*` requests to the backend server at http://localhost:8000. This is configured in `vite.config.ts`.

### Build

To build the frontend for production:
```bash
npm run build
```

This outputs optimized static files to `../static/` which are then embedded into the Rust binary.

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx        # Entry point
│   ├── App.tsx         # Main app component with routes
│   ├── App.css         # App-specific styles
│   ├── index.css       # Global styles (Tailwind)
│   └── assets/         # Static assets
├── public/             # Public assets (copied as-is)
├── .env.development    # Development environment variables
├── .env.production     # Production environment variables
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
