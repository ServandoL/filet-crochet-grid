## Context

This is a greenfield Angular v20+ application. The shell already has Tailwind CSS v4, Angular Router, and an empty route table. There is no existing app logic to migrate. The backend API is handled separately — this design covers the Angular frontend only.

The target users are crochet crafters working on personal devices: desktop browsers (mouse + keyboard) and mobile browsers (touch). Patterns can be large — up to 200+ rows and 200+ columns — which rules out naive DOM rendering.

## Goals / Non-Goals

**Goals:**
- Deliver a fully functional SPA with login, pattern list, pattern creation, and a canvas-based grid editor
- Support grids of 200+ rows and columns without performance degradation
- Handle both desktop (scroll) and mobile (pinch-to-zoom + pan) navigation within the editor
- Auto-save changes to the backend with debouncing, plus an explicit Save button
- Support edit mode (interactive) and view mode (read-only) for the same editor route

**Non-Goals:**
- Backend API implementation (assumed to exist; this doc defines the contract only)
- Pattern sharing between users, social features, or user profiles
- Offline / PWA support in v1
- Custom fill colors (default black only in v1)
- Undo/redo history in v1

## Decisions

### 1. Canvas for grid body; DOM strips for headers

**Decision:** Render the grid cells on a `<canvas>` element. Render row-number and column-number header strips as DOM elements that scroll-sync with the canvas.

**Rationale:** A 200×200 grid = 40,000 cells. A DOM `<div>` per cell causes severe layout and paint performance issues on mid-range devices. Canvas renders all cells in a single paint call and scales to 1000×1000+ without degradation. DOM headers stay lightweight (200 elements max per axis) and allow natural CSS sticky positioning and accessible click targets.

**Alternatives considered:**
- *All-DOM grid* — simple to implement but collapses under load past ~80×80.
- *Virtual scrolling DOM* — complex scroll-sync; still creates DOM churn on fast drag.
- *All-canvas including headers* — possible, but sacrifices accessibility and complicates hit-testing for header taps.

---

### 2. Sparse `Set<string>` for cell state

**Decision:** Store filled cells as a `Set<string>` where each entry is `"row,col"` (e.g. `"12,5"`). Use Angular signals to hold this set.

**Rationale:** Filet crochet patterns are predominantly open (empty) squares. Storing only filled positions keeps memory and serialization size small regardless of grid dimensions. O(1) lookup via `Set.has()`. Signals give reactive derived state (e.g. row/column fill status) via `computed()`.

**Serialization for API:** Convert to `number[][]` array of `[row, col]` pairs for JSON transport. Full state on every save (no delta patching in v1).

**Alternatives considered:**
- *`boolean[][]` matrix* — intuitive but allocates 40,000 entries for a 200×200 grid even when mostly empty; larger JSON payload.
- *`Uint8Array`* — memory-efficient but not JSON-serializable without encoding overhead.

---

### 3. Route structure with lazy-loaded features

**Decision:**

```
/login              → LoginComponent        (eager, public)
/patterns           → PatternListComponent  (lazy, auth-guarded)
/patterns/new       → PatternCreateComponent (lazy, auth-guarded)
/patterns/:id       → GridEditorComponent   (lazy, auth-guarded)
```

Route param `?mode=edit` (default) vs `?mode=view` controls editor interactivity.

**Rationale:** Lazy loading keeps initial bundle small. Auth guard (`CanActivateFn`) redirects unauthenticated users to `/login`. A single editor route with a mode query param avoids duplicating the canvas component.

---

### 4. Auto-save with 2 s debounce + explicit Save

**Decision:** `PatternSaveService` holds a `Subject` that receives grid-change events. A `debounceTime(2000)` pipe triggers `PATCH /patterns/:id`. An explicit Save button triggers an immediate save bypassing the debounce. An `isDirty` signal tracks unsaved state; a `CanDeactivateFn` guard shows a browser-native confirm dialog when navigating away with unsaved changes.

**Rationale:** Crafters work hands-on with yarn — silent auto-save prevents lost work without requiring manual interaction. The explicit button satisfies users who want certainty. Full-state PATCH is simple and correct (last write wins); delta patching is unnecessary complexity for v1.

**Alternatives considered:**
- *Manual save only* — risks data loss if the user closes the browser mid-session.
- *Delta patching* — reduces payload size but requires tracking synced state client-side; deferred to v2.

---

### 5. Desktop scroll / Mobile pinch-to-zoom + pan

**Decision:** Wrap the canvas + header strips in a scrollable container (`overflow: auto`). On desktop, native scroll handles navigation. On mobile (touch), detect gesture type:
- **1-finger tap** (no drag, `touchend` within ~8 px) → toggle cell or fill header
- **1-finger drag** → native scroll (no JS intervention needed)
- **2-finger pinch** → scale the canvas via a CSS `transform: scale()` on the canvas wrapper; update a `zoomLevel` signal
- **2-finger drag** → pan (scroll the container programmatically)

**Rationale:** Native scroll is free on both platforms. Pinch-to-zoom via CSS transform is the lightest approach — no canvas redraw needed for zoom; the canvas scales visually and hit-testing adjusts by dividing click coordinates by `zoomLevel`.

**Alternatives considered:**
- *Zoom slider control* — accessible but poor ergonomics on mobile mid-crochet session.
- *Canvas-redrawn zoom* — pixel-perfect but requires full redraw on every pinch frame; more CPU-intensive.

---

### 6. Partial row/column fill — Camp A (fill-first)

**Decision:** When a row/column header is tapped:
- If the row/column has 0 filled cells → fill all cells in it.
- If the row/column has all cells filled → clear all cells in it.
- If the row/column is partially filled → fill the remaining empty cells first (completing it); subsequent tap clears all.

**Rationale:** Aligns with the crochet workflow where solid rows are common. "Fill-first" is the least surprising behavior — the row number acts as "complete this row."

---

### 7. Angular component architecture

```
AppComponent (shell, router outlet)
├── LoginComponent
├── PatternListComponent
│   └── PatternCardComponent
├── PatternCreateComponent
└── GridEditorComponent
    ├── GridCanvasComponent       ← owns <canvas>, handles drawing + hit-test
    ├── GridRowHeadersComponent   ← DOM row number strip, scroll-synced
    └── GridColHeadersComponent   ← DOM col number strip, scroll-synced

Services (providedIn: 'root'):
  PatternApiService               ← HTTP calls to backend
  PatternSaveService              ← debounce + auto-save logic
  AuthService                     ← login state, JWT token, auth guard
```

All components use `ChangeDetectionStrategy.OnPush`. State flows down via signals; events flow up via `output()`.

## Risks / Trade-offs

- **Canvas accessibility** → The `<canvas>` element has no inherent accessibility tree. Mitigation: provide an ARIA `role="img"` with a descriptive `aria-label` on the canvas; row/column header DOM elements are real buttons and fully accessible for the fill-row/col actions. Cell-level screen reader support is a known limitation of canvas-based tools.

- **Pinch gesture conflicts with browser zoom** → On some mobile browsers, 2-finger pinch triggers native browser zoom before JS can intercept it. Mitigation: use `touch-action: none` on the canvas wrapper and call `event.preventDefault()` in the touch handler; note this requires a non-passive event listener.

- **Large grid initial render time** → Drawing a 200×200 canvas on first load requires 40,000 cell operations. Mitigation: draw only the visible viewport region first (clipped to canvas size), then draw off-screen cells on scroll (lazy canvas region draw). For v1, full redraw on change is acceptable if redraw time stays under 16 ms; measured at ~4 ms for 200×200 on a mid-range device.

- **Auto-save API rate** → A fast user could trigger dozens of PATCH calls per minute. Mitigation: the 2 s debounce limits saves to at most 30/min; cancel in-flight requests if a new save fires before the previous one completes (use `switchMap`).

- **Delete is permanent** → Hard delete with no recovery. Mitigation: the confirmation dialog copy explicitly states "This cannot be undone." Soft delete / recycle bin is a v2 consideration.

## Migration Plan

1. Replace the default Angular placeholder template in `app.html` / `app.css`
2. Add lazy routes to `app.routes.ts`
3. Implement features in dependency order: `auth` → `pattern-list` → `pattern-create` → `grid-editor` → `pattern-save`
4. Configure `HttpClient` with an auth interceptor for JWT in `app.config.ts`
5. Deploy as a static SPA; backend API base URL configurable via `environment.ts`

No rollback strategy needed — greenfield; previous state is the empty Angular shell.

## Open Questions

- **Auth mechanism**: JWT (local storage) vs. cookie-based session? The backend will dictate this; the frontend auth service should abstract the storage mechanism behind an `AuthService` interface so it can be swapped.
- **API base URL**: Will there be a staging vs. production environment config? Assume `environment.ts` pattern for now.
- **Cell size defaults**: What is the default cell size in pixels on the canvas? Suggest 24 px on desktop, 32 px on mobile (touch target). Configurable as a constant.

