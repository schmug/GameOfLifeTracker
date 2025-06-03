# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with both frontend and backend
- `npm run build` - Build the application (frontend to dist/public, backend to dist/)
- `npm start` - Run production server
- `npm run check` - TypeScript type checking
- `npm test` - Run tests with Vitest

### Database
- `npm run db:push` - Push database schema changes (Drizzle)

## Architecture

This is a full-stack Conway's Game of Life application with dual deployment modes:

### Project Structure
- `client/` - React frontend with TypeScript
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and schemas
- `public/` - Static assets including game pattern SVGs

### Dual App Architecture
The application automatically detects the deployment environment:
- **Development/Production**: Full-stack app with Express server and React client
- **GitHub Pages**: Static-only app (`GitHubPagesApp.tsx`) using localStorage for high scores

The switch happens in `client/src/main.tsx` based on hostname detection.

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### Game Engine
Core game logic is in `client/src/lib/gameOfLife.ts` with:
- Colorful cell visualization (each cell has unique HSL colors)
- Neighbor color inheritance for new cells
- Grid wrapping for infinite board simulation
- Pattern detection and game ending conditions

### State Management
- TanStack Query for server state management
- React hooks for local game state
- localStorage fallback for GitHub Pages deployment

### UI Components
Uses shadcn/ui component library with Radix UI primitives and Tailwind CSS.

### Environment Variables
- `VITE_BASE_URL` - Set for GitHub Pages deployment (e.g., `/GameOfLifeTracker/`)

### Deployment
- **GitHub Pages**: Static deployment using `GitHubPagesApp.tsx`
- **Cloudflare Workers**: Static site deployment using `wrangler.toml` (deploys `dist/public`)