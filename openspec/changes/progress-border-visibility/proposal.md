## Why

In Progress mode the canvas renders a teal inset border around each highlighted cell to show the user where they've marked completion. That border is drawn with a single fixed colour (`#0f766e`, teal-700) and a 2 px `lineWidth` regardless of what is underneath it.

On **white (empty) cells** the border is just visible — teal-700 produces ~5:1 contrast on white, which passes WCAG AA. On **black (filled) cells** it is nearly invisible — the same colour produces only ~4.15:1 on black which, while technically passing 3:1 non-text contrast, is perceptually very hard to see because there is no brightness discontinuity between the dark teal and the solid black fill. The thin 2 px ring compounds the problem.

This change fixes the visibility issue with the minimum possible intervention: an **adaptive per-cell colour** inside `drawGrid()` and a slightly thicker ring.

## What Changes

- `GridCanvasComponent.drawGrid()`: for each highlighted cell, check whether it is also in `filledCells`. If yes, draw the ring in white (`#ffffff`, 21:1 on black); if no, draw it in teal-700 (`#0f766e`, ~5:1 on white). Bump `lineWidth` from 2 → 3 for additional visual weight.
- `openspec/changes/progress-tracking-flow/tasks.md`: correct the contrast claim in task 12.3 to reflect the new adaptive approach and remove the inaccurate "3.04:1 on black" figure.

## Capabilities

### Modified Capabilities
- `progress-tracking`: Progress highlight border is now clearly visible on both filled (black) and empty (white) cells

## Impact

**Frontend:**
- `src/app/features/editor/components/grid-canvas/grid-canvas.component.ts` — `drawGrid()` only; no input/output changes, no template changes
- `openspec/changes/progress-tracking-flow/tasks.md` — prose correction in task 12.3

