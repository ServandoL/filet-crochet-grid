## Context

The app already has a canvas-based grid editor with two modes: `edit` (interactive, auto-saves to backend) and `view` (read-only display). The editor route is `/patterns/:id?mode=edit|view`. The existing `GridCanvasComponent` renders pattern cells (filled = black) on a `<canvas>` element. Row and column headers are DOM `<button>` strips. State flows through Angular signals; saves are debounced 2 s via `PatternSaveService`.

Crafters need a way to track physical progress through a pattern — marking rows, columns, and individual cells they've already crocheted. This state is distinct from the pattern design and must survive browser restarts.

## Goals / Non-Goals

**Goals:**
- Add a third editor mode (`progress`) reachable via `?mode=progress`
- Let users tap row headers, column headers, and individual cells to mark them highlighted (done)
- Persist progress to the backend and restore it on re-entry
- Mirror the edit-mode save UX: debounced auto-save + explicit Save button + dirty indicator
- Show a non-blocking warning when the pattern was edited after progress was last saved
- Provide a "Clear All Progress" action within the progress toolbar
- Render highlighted cells as a 2 px inset teal border overlay on the canvas
- Use larger touch targets (min 44 px) for row/col headers in progress mode

**Non-Goals:**
- Multiple progress sessions per pattern (v1: one session, always overwritten)
- Progress sharing between users
- Undo/redo of progress marks
- Visual difference between highlighted pattern cells and highlighted empty cells beyond the border
- Native mobile app — browser-only

## Decisions

### 1. Separate `progress` MongoDB collection, keyed by `patternId`

**Decision:** Store progress in a new `PROGRESS` collection with a unique index on `patternId`. The document shape is `{ _id, patternId, highlightedCells: [row, col][], updatedAt }`.

**Rationale:** Embedding progress in the pattern document couples two orthogonal concerns — pattern design and crafter state. They change independently (pattern edited in edit mode, progress updated in progress mode) and benefit from separate `updatedAt` timestamps, which is required for the stale-progress warning. A separate collection with a `patternId` unique index gives O(1) upsert and lookup with no complicated update logic on the existing pattern endpoint.

**Alternatives considered:**
- *Embed in pattern document* — simpler read (one fetch), but muddies the PATCH endpoint and races with design edits.
- *`localStorage` only* — zero backend work, but progress is lost when switching devices, which fails the "reopen from previous save" requirement.

---

### 2. `PUT` (full-replace upsert) for progress saves

**Decision:** `PUT /api/patterns/:id/progress` always writes the complete `highlightedCells` array, using MongoDB `updateOne` with `upsert: true` and `$set`.

**Rationale:** Progress state is held entirely in-memory as a `Set<string>` signal. Writing the full snapshot is simpler and more correct than delta-patching (no need to track which cells changed). This mirrors how the existing pattern PATCH works for `cells`. The payload is small (typically tens to low hundreds of `[row, col]` pairs).

**Alternatives considered:**
- *`PATCH` with add/remove arrays* — lower payload on large grids, but requires client-side change tracking and more complex backend merge logic.

---

### 3. Progress state is cell-level only — no separate row/col arrays

**Decision:** Only `highlightedCells: [row, col][]` is stored. Tapping a row header adds all cells in that row to `highlightedCells` (Camp A fill-first); tapping again removes them. No `highlightedRows` or `highlightedCols` arrays.

**Rationale:** The existing `fillRow`, `fillCol`, `toggleCell` utilities in `grid.utils.ts` operate on a `Set<string>` and are directly reusable on `progressCells` without modification. Cell-level storage also allows partial row/column highlights (e.g. user tapped a row header to highlight the whole row, then untapped one cell). A separate row array would be redundant.

---

### 4. Canvas overlay: 2 px inset teal border per highlighted cell

**Decision:** Add an optional `highlightedCells: Set<string>` input to `GridCanvasComponent` (defaults to empty Set). After drawing pattern cells, loop over `highlightedCells` and draw a `strokeRect` 2 px inset from each cell's bounds using `#14b8a6` (Tailwind `teal-500`).

**Rationale:** A border approach is visible against both white (empty cell) and black (filled cell) backgrounds, unlike a semi-transparent fill which disappears on black. The inset ensures the border is fully within cell bounds and does not bleed into adjacent cells. Drawing is O(highlighted) — same complexity as the existing filled-cell pass, negligible for typical progress sizes. Existing edit/view modes pass no `highlightedCells` input, so the component is backward-compatible.

**Alternatives considered:**
- *Semi-transparent fill* — invisible on black cells.
- *Checkmark icon drawn on canvas* — requires font loading or SVG path data on canvas; harder to size consistently.
- *CSS overlay element on top of canvas* — breaks the single-canvas architecture; complicates hit-testing.

---

### 5. `ProgressSaveService` mirrors `PatternSaveService`

**Decision:** Create a new `ProgressSaveService` (`providedIn: 'root'`) with the same interface: `isDirty` signal, `saveStatus` signal, `scheduleAutoSave(state)` (2 s debounce), `saveNow(state)`. The save target is `PUT /api/patterns/:id/progress`.

**Rationale:** The save UX requirement ("mirror edit mode") is explicitly stated. Reusing the same conceptual pattern avoids teaching users a new interaction model. A separate service keeps concerns isolated — progress saves never interfere with pattern design saves.

---

### 6. Stale-progress warning via timestamp comparison

**Decision:** On progress mode load, compare `pattern.updatedAt` with `progress.updatedAt`. If `pattern.updatedAt > progress.updatedAt`, show a dismissable amber warning banner in the toolbar: *"Pattern was edited after your last progress save. Row or cell positions may have shifted."*

**Rationale:** When a pattern's row/col count changes, saved `highlightedCells` indices may refer to cells that no longer exist or have shifted meaning. Rather than clearing progress automatically (data loss) or silently showing misaligned highlights, the warning gives the crafter full information to decide. It does not block interaction. When the user saves new progress, `progress.updatedAt` is bumped and the banner disappears on next load.

**Alternatives considered:**
- *Auto-clear progress on pattern edit* — data loss without user consent.
- *No warning (ignore the problem)* — silently misleading; progress markers appear on wrong rows.

---

### 7. Larger touch targets in progress mode

**Decision:** Pass a `progressMode: boolean` input to `GridRowHeadersComponent` and `GridColHeadersComponent`. When `true`, each button's height/width uses `Math.max(cellSize, 44)` instead of `cellSize`. 44 px is the WCAG 2.5.5 minimum touch target size.

**Rationale:** In progress mode the primary interaction is tapping header buttons with a finger while holding yarn — small targets cause errors. The canvas size does not change; only the header strip grows. This produces a small visual offset (header taller/wider than cell), which is acceptable given the use case.

---

### 8. Route: third mode on existing `/patterns/:id` route

**Decision:** Add `?mode=progress` as a third value for the existing `mode` query param on the `/patterns/:id` route. No new route or component.

**Rationale:** The route already uses `withComponentInputBinding()` to bind `mode` as a component input. `GridEditorComponent` gains `isProgressMode = computed(() => mode() === 'progress')`. All three modes share the same pattern load logic; only the canvas overlay and save target differ.

## Risks / Trade-offs

- **Stale index risk on large edits** — If a crafter adds 10 rows to the middle of a 100-row pattern, saved `highlightedCells` row indices above the insertion point are now off by 10. The stale-progress warning notifies but does not auto-correct. Accepted for v1; row-renumbering on pattern edit is a v2 concern.

- **Progress on deleted patterns** — If a pattern is deleted, its progress document becomes an orphan. Mitigation: `DELETE /api/patterns/:id` should cascade-delete the progress document in the same request. This requires backend coordination.

- **Single progress session** — Two people using the same account cannot have independent progress on the same pattern. Accepted as a v1 constraint; the proposal explicitly calls out a future "duplicate pattern" feature.

- **44 px headers misalign with canvas at small cell sizes** — When `cellSize < 44` in progress mode, the header buttons are taller/wider than the corresponding canvas cells. The visual seam is noticeable. Mitigation: document as a known v1 cosmetic trade-off; a future improvement could scale the canvas to match.

## Migration Plan

1. Backend: add `PROGRESS` collection, new routes, new service, types, Zod schemas
2. Frontend models/services: `ProgressState`, `ProgressDto`, `pattern-api.service` additions, `ProgressSaveService`
3. Frontend components: `GridCanvasComponent` overlay, header `progressMode` input
4. Frontend editor: `isProgressMode` computed, parallel load, progress toolbar, stale warning
5. Pattern card: Progress button
6. `DELETE /patterns/:id` backend: cascade delete progress document

No rollback strategy needed — additive change; existing edit and view modes are untouched.

## Open Questions

- Should the cascade delete of progress on pattern delete happen in the controller or the service layer? (Recommendation: service layer — `PatternsService.deletePattern` calls `ProgressService.deleteByPatternId` before or after the pattern delete.)
- Should `GET /api/patterns/:id/progress` return `404` or an empty progress object `{ highlightedCells: [] }` when no progress exists? (Recommendation: `200` with empty array to simplify frontend null-handling; but `404` is more semantically correct and the frontend can treat it as "no prior progress".)

