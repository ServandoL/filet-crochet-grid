# Filet Crochet Grid

A full-stack editor for filet crochet patterns: design a grid pattern, save it,
and track your progress stitch by stitch as you work it.

## What it does
- Interactive grid editor (canvas-based) with row/column headers, section
  overlays, and filled / empty / no-stitch cells
- Pattern create, list, and save flows, with unsaved-changes protection
- Progress tracking mode that highlights where you are in the pattern
- Auth with route guards and an HTTP auth interceptor

## Architecture
- **Frontend:** Angular 21, TypeScript, standalone components, feature-based
  structure (`core/` services and guards, `features/` editor and patterns)
- **Backend (in this repo):** Koa 3 + TypeScript (ESM), MongoDB driver,
  Zod schemas for validation, Winston logging, rate limiting
- **Backend (Spring Boot version):** the same API is also implemented in Java —
  see [filet-crochet-sb](https://github.com/ServandoL/filet-crochet-sb)
- **Deployment:** multi-stage Docker build, nginx serves the SPA and proxies
  `/api`, docker-compose wires frontend + backend

## Developed spec-first
Features are designed before they are built. Proposals, designs, specs, and
task lists live under `openspec/` (OpenSpec), including the archived history of
shipped changes — start there to see how a feature evolved.

## Running locally
```bash
npm install
npm start            # Angular dev server on http://localhost:4200
# backend
cd backend && npm install && npm run build && npm start
# or the full stack
docker compose up --build
```

## Tests
Angular unit specs cover the grid canvas, grid editor, and grid utilities
(`*.spec.ts` alongside the code). Run with `npm test`.
