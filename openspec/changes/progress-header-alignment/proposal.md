## Why

In Progress mode, `GridRowHeadersComponent` and `GridColHeadersComponent` inflate their button size to `Math.max(cellSize, 44)` to meet the WCAG 2.5.5 minimum touch target of 44 px. The canvas, however, always renders cells at the raw `cellSize` (default 24 px). This causes the header strips to be taller/wider than the canvas rows/columns they label, producing visible misalignment from row 2 onwards.

Reverting the 44 px floor is the right call now — no user reports exist for the touch-target issue, and the misalignment is a concrete, visible bug. The 44 px enhancement can be revisited with proper canvas coordination if needed.

## What Changes

- `GridRowHeadersComponent`: simplify `buttonSize` to always equal `cellSize()` — remove the `progressMode`-conditional 44 px floor
- `GridColHeadersComponent`: same simplification

## Capabilities

### Modified Capabilities
- `progress-tracking`: Row and column headers now align with canvas cells in progress mode

## Impact

**Frontend:**
- `src/app/features/editor/components/grid-row-headers/grid-row-headers.component.ts`
- `src/app/features/editor/components/grid-col-headers/grid-col-headers.component.ts`

