## 1. Fix progress highlight border in `drawGrid()`

- [x] 1.1 In `GridCanvasComponent.drawGrid()`, replace the fixed `strokeStyle = '#0f766e'` and `lineWidth = 2` with an adaptive per-cell colour (`'#ffffff'` on filled cells, `'#0f766e'` on empty cells) and `lineWidth = 3`; update the inline comment to reflect the new approach and correct contrast values

## 2. Correct tasks.md 12.3

- [x] 2.1 Update task 12.3 in `openspec/changes/progress-tracking-flow/tasks.md` to describe the adaptive border approach with accurate contrast ratios

