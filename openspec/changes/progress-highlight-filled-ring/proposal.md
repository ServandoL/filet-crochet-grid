## Why

A previous change (`progress-border-visibility`) made the progress highlight ring adaptive: white (`#ffffff`) on filled (black) cells, teal-700 on empty (white) cells. The white ring on black cells is high-contrast in isolation (21:1), but visually bleeds into adjacent empty white cells — the ring colour is indistinguishable from the canvas background at the cell boundary. The result looks broken: the ring appears to dissolve at the edges of the black cell.

## What Changes

On filled (black) highlighted cells only, draw two concentric rings instead of one:
1. A thin dark outer ring (`#000000`, 1 px, inset 1 px) — anchors the highlight to the cell boundary and prevents it bleeding into the white background
2. The existing white inner ring (`#ffffff`, 3 px, inset 3 px) — the visible highlight indicator

Empty (white) highlighted cells are unchanged: single teal-700 ring, 3 px, inset 2 px.

## Capabilities

### Modified Capabilities
- `progress-tracking`: Filled highlighted cells render a double ring (dark outer halo + white inner) so the highlight is visually bounded and does not bleed into adjacent white cells

## Impact

**Frontend:**
- `src/app/features/editor/components/grid-canvas/grid-canvas.component.ts` — `drawGrid()` progress overlay block only; no input/output or template changes

