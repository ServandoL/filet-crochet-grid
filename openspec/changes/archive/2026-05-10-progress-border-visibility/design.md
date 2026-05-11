## Context

`GridCanvasComponent.drawGrid()` renders the grid in three sequential passes:

1. **Background** — white `fillRect` over the whole canvas
2. **Filled cells** — black `fillRect` for each key in `filledCells` (inset 1 px from cell origin)
3. **Grid lines** — 0.5 px `#d1d5db` strokes
4. **Progress overlay** — `strokeRect` inset 2 px, `lineWidth = 2`, `strokeStyle = '#0f766e'`

The `filled` `Set<string>` is already read at the top of `drawGrid()` and is in scope when the progress overlay loop runs. No new inputs, signals, or architectural changes are needed — the fix is entirely local to the overlay loop.

## Goals / Non-Goals

**Goals:**
- Make the progress highlight visible on both black (filled) and white (empty) cells
- Use the highest available contrast on each background
- Keep the change to the smallest possible diff (one function, ~5 lines)
- Update the inaccurate contrast claim in `tasks.md` 12.3

**Non-Goals:**
- Changing any component input or output
- Changing template markup
- Zoom-aware ring scaling (separate concern)
- Semantic distinction between highlighted-filled vs highlighted-empty cells (out of scope per original design)

## Decisions

### 1. White ring on filled cells, teal-700 ring on empty cells

**Decision:** `ctx.strokeStyle = filled.has(key) ? '#ffffff' : '#0f766e'`

**Rationale:**

```
Background   Chosen colour   Contrast ratio   WCAG threshold
──────────── ─────────────── ──────────────── ──────────────
Black #000   White #ffffff        21:1        AA ✓✓✓ (needs 3:1)
White #fff   Teal-700 #0f766e     5.07:1      AA ✓  (needs 3:1)
```

White on black is the highest possible contrast and the most perceptually obvious choice. Teal-700 on white preserves the existing visual language (the teal theme used in the progress toolbar) while still passing WCAG AA. No other single colour achieves acceptable contrast on both backgrounds — adaptive per-cell is the only robust solution.

**Alternatives considered:**
- *Single high-luminance colour (e.g. amber-400)* — good on black (~11:1), fails on white (~1.9:1). Same problem, different axis.
- *Semi-transparent teal fill overlay* — visible on both but visually alters the pattern itself, which is confusing for the user trying to read their design while tracking progress.
- *Thicker ring only, same colour* — improves visual weight but leaves the black-cell case with the same near-invisible dark teal.

### 2. lineWidth 2 → 3

**Decision:** `ctx.lineWidth = 3`

**Rationale:** At `DEFAULT_CELL_SIZE = 24 px`, a 2 px ring occupies 8% of the cell dimension. At 3 px it occupies 12.5% — a 50% increase in visual mass with zero geometry risk (stroke outer edge at `2 + 1.5 = 3.5 px` from cell boundary, fully inside the black fill which starts at `+1 px`). This matters most at zoom < 1 where the CSS-scaled canvas makes thin rings nearly invisible.

### 3. No change to strokeRect coordinates

The existing `ctx.strokeRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4)` inset is correct at `lineWidth = 3`. The stroke centre lands at `2 + 1.5 = 3.5 px` from the cell edge; the outer stroke edge is at `2 px`, which is inside the fill region (fill starts at `+1 px`). No coordinate adjustment needed.

## Implementation

The entire change is inside the progress overlay block in `drawGrid()`:

```typescript
// BEFORE
ctx.strokeStyle = '#0f766e'; // teal-700 — meets WCAG AA 3:1 on both white and black
ctx.lineWidth = 2;
for (const key of highlighted) {
  const [r, c] = key.split(',').map(Number);
  ctx.strokeRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4);
}

// AFTER
ctx.lineWidth = 3;
for (const key of highlighted) {
  const [r, c] = key.split(',').map(Number);
  // Adaptive colour: white (21:1) on filled (black) cells; teal-700 (5.07:1) on empty (white) cells
  ctx.strokeStyle = filled.has(key) ? '#ffffff' : '#0f766e';
  ctx.strokeRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4);
}
```

`filled` is already declared at the top of `drawGrid()` — no new variable needed.

