@README.md
@.github/copilot-instructions.md

## Part of the home stack

This is one of five home apps served at `home.ksl-apps.dev`. The stack (nginx, Cloudflare Tunnel,
every API) lives in `~/WebstormProjects/home-server`; read its `README.md` for the full picture.

- Served at `/filet-crochet/` (`baseHref`); calls `/filet-crochet-api/` and `/household-api/`.
- The API in production is the Spring Boot repo `~/IdeaProjects/filet-crochet`, not the Koa
  `backend/` folder here. Households: `~/IdeaProjects/household-api-sb`. An API change belongs in
  the Spring repo.
- Deploy from `home-server`, not from this repo: `make filet-crochet-grid` builds the UI and it is
  live once copied (nginx serves it through a bind mount); `make deploy-filet-crochet` also rebuilds
  the API. The `Dockerfile`, `docker-compose.yml`, `nginx/` and `npm run docker:*` scripts here are
  an older standalone setup that binds ports 80/443; don't run them.
- `@home/ui` is a packed tarball from `~/WebstormProjects/home-ui-theme`, pinned in `package.json`
  as `file:…/builds/home-ui-X.Y.Z.tgz`. The app uses its shell, household gate and realtime
  updates. A fix to a shared component belongs in
  home-ui-theme.

## Working here

- npm, not pnpm (`package-lock.json`). After editing the `@home/ui` pin, run `npm install`.
  `npm run build` must pass before a deploy; `npm test` runs the unit tests.
- Commit and push straight to `main`. Messages: `feat: …` / `fix: …`, or
  `Bump @home/ui to X.Y.Z: <what changed>`.
- Feature work is planned in `openspec/` (specs and changes).
