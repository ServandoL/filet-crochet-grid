## Context

The grid editor renders a pattern on an HTML `<canvas>` element. Cell state is managed as a sparse `Set<string>` of `"row,col"` keys for filled cells. Currently only two cell states exist (empty / filled), stored as the `filledCells` set on `GridState`. The canvas hardcodes `#ffffff` for empty cells and `#000000` for filled cells.

Users of shaped filet crochet patterns (doilies, motifs, garments) need to mark corner and edge areas that fall outside the actual crochet shape. Without a dedicated state, they overload the filled-cell state as a boundary marker — making the pattern ambiguous to follow.

## Goals / Non-Goals

**Goals:**
- Introduce a third cell state — "no stitch" — stored as `excludedCells: Set<string>` on `GridState` and persisted on the `Pattern` document.
- Add a "No Stitch" tool toggle to the editor toolbar (alongside the existing "Fill" implicit default).
- No-stitch cells render as gray (`#9ca3af`) and are visually distinct from both empty (white) and filled (black).
- No-stitch and fill states are **mutually exclusive**: activating no-stitch on a filled cell removes it from `filledCells`.
- Row/column header interactions respect the active tool using the same Camp A fill-first logic.
- No-stitch cells are excluded from fill-row/fill-column operations when the fill tool is active.
- No-stitch cells cannot receive progress highlights in progress mode.

**Non-Goals:**
- Per-cell arbitrary color theming (not this change).
- Restoring fill state when un-no-stitching a cell (un-exclude returns to empty, not prior fill).
- A dedicated "no-stitch shape" import/export format.

## Decisions

### 1. Store `excludedCells` on Pattern (not Progress)

**Decision**: `excludedCells: FilledCell[]` lives on the Pattern document alongside `cells`.

**Rationale**: No-stitch zones are design intent — part of the pattern shape — not a personal tracking annotation. They should be visible in view mode, visible to anyone who opens the pattern, and survive independently of the progress document.

**Alternative considered**: Storing on Progress document. Rejected because: (a) no-stitch zones are authored during pattern design, not during tracking; (b) they would be lost if progress is cleared; (c) they should appear in view mode where progress isn't loaded.

---

### 2. Sparse `Set<string>` — same approach as `filledCells`

**Decision**: `GridState.excludedCells` is `Set<string>` of `"row,col"` keys. Wire format is `FilledCell[]` (same as `cells`).

**Rationale**: Consistent with existing sparse-set approach. O(1) membership tests. Zero overhead for patterns with no no-stitch cells (backward compatible — field defaults to empty array on API, empty Set in state).

---

### 3. Active tool as a signal on `GridEditorComponent`

**Decision**: `activeTool = signal<'fill' | 'no-stitch'>('fill')` on `GridEditorComponent`. Child header components emit the same `rowClicked`/`colClicked` events regardless of tool; the parent routes to `fillRow`/`noStitchRow`/etc. based on `activeTool()`.

**Rationale**: Tool state is editor-level (not canvas-level), so it belongs on the orchestrating component. Keeps `GridCanvasComponent` and header components tool-agnostic — they need no knowledge of the active tool. Minimal blast radius.

**Alternative considered**: Passing active tool down as input to all child components and having them self-route. Rejected — bleeds tool concept into components that don't need it.

---

### 4. No-stitch and fill are mutually exclusive; un-exclude returns to empty

**Decision**: Activating no-stitch on a filled cell removes it from `filledCells` first. Un-no-stitching (tap a no-stitch cell with the no-stitch tool) returns it to empty, not to its prior fill state.

**Rationale**: Tracking prior fill state to restore on un-exclude adds complexity for a rare edge case (who accidentally no-stitches a filled cell?). Returning to empty is predictable and consistent.

---

### 5. Canvas draw order

**Decision**: Background (white) → no-stitch cells (gray, solid fill) → filled cells (black) → grid lines → progress highlights.

**Rationale**: No-stitch is drawn before filled cells so the two layers are visually independent. Grid lines go on top of all fills for crisp borders. Progress highlights are always the topmost layer.

No-stitch cells additionally: skip progress highlight rendering (highlight is blocked at interaction time and at draw time).

---

### 6. Fill-row/fill-col skips no-stitch cells; no-stitch-row/no-stitch-col skips filled cells

**Decision**:
- `fillRow(row, filledCells, excludedCells)`: Camp A logic over cells that are **not** excluded. No-stitch cells are invisible to this operation.
- `noStitchRow(row, filledCells, excludedCells, cols)`: Camp A logic over cells that are **not** already no-stitch. If any non-excluded cell exists → exclude all non-excluded cells (and remove them from filled). If all non-excluded cells are excluded → remove all from excluded (return to empty).

**Rationale**: The fill tool should never touch no-stitch cells — they're outside the pattern. The no-stitch tool should not double-exclude already-excluded cells.

---

### 7. Backend and schema changes are additive (non-breaking)

**Decision**: `excludedCells` is added as an optional field (defaults to `[]`) in both Zod schemas and MongoDB documents.

**Rationale**: Existing patterns have no `excludedCells` field. Treating absence as `[]` means no migration script is needed. The `PATCH` endpoint accepts the field but does not require it.

## Risks / Trade-offs

- **Large excluded areas on big grids**: A 200×200 pattern with 20,000 excluded cells is unlikely but theoretically possible. The sparse Set approach handles this gracefully — same as filled cells.
- **No-stitch ambiguity in progress mode**: If the user adds no-stitch zones _after_ taking progress, some progress highlights may now sit on no-stitch cells. Those highlights are not removed automatically — they're just not rendered. `Clear All Progress` remains available. → Acceptable trade-off; the stale-progress warning banner already exists for similar drift scenarios.
- **Touch UX for tool switching**: On mobile, the toolbar tool toggle must be large enough (≥44 px touch target). Toolbar space is limited — must not crowd existing controls.

## Open Questions

- Should the no-stitch tool be accessible from the keyboard (e.g., N key shortcut) in a future iteration? Not in scope now.
- Should view mode show no-stitch cells as gray? Yes — they are part of the pattern design. Viewers should see the shape.

