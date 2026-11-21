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
- **Frontend:** Angular 22, TypeScript, standalone components, feature-based
  structure (`core/` services and guards, `features/` editor and patterns)
- **Backend (production):** the Spring Boot API in
  [filet-crochet-sb](https://github.com/ServandoL/filet-crochet-sb)
- **Backend (in this repo, older):** Koa 3 + TypeScript (ESM), MongoDB driver,
  Zod schemas for validation, Winston logging, rate limiting
- **Deployment:** on the home server, served at `/filet-crochet/` and deployed from the
  `home-server` repo (`make filet-crochet-grid`, or `make deploy-filet-crochet` to include the API).
  The `Dockerfile`, `docker-compose.yml` and `nginx/` here are the older standalone setup.

## Households and the API
On the home server every pattern belongs to a household, shared with the other home apps and managed
in Home (`/household`). The app is wrapped in `HouseholdGateComponent` from `@home/ui/household`: it
loads `/household-api/api/v1/me`, picks your household (or asks, if you're in several), and only
then renders the `@home/ui` shell around the routes, like the other home apps. `householdInterceptor`
adds `X-Household-Id` to every crochet call. Styling comes from `@home/ui/theme.css`, and
`@home/ui/realtime` streams other devices' changes so the pattern list and editor refetch.

`ng serve` proxies `/filet-crochet-api` to the Spring Boot API on `localhost:9010` and
`/household-api` to household-api on `localhost:9020` (`proxy.conf.json`), as nginx does on the home
server.

## Developed spec-first
Features are designed before they are built. Proposals, designs, specs, and
task lists live under `openspec/` (OpenSpec), including the archived history of
shipped changes — start there to see how a feature evolved.

## Running locally
```bash
npm install
npm start            # Angular dev server on http://localhost:4200
```

Run the Spring Boot API and household-api alongside it (see the proxy ports above). The older Koa
backend still runs with `cd backend && npm install && npm run build && npm start`, but production
doesn't use it. Avoid `docker compose up`: the standalone stack binds ports 80 and 443.

## Tests
Angular unit specs cover the grid canvas, grid editor, and grid utilities
(`*.spec.ts` alongside the code). Run with `npm test`.
