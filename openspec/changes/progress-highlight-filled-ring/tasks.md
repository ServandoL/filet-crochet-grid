## 1. Fix filled-cell highlight rendering in `drawGrid()`

- [x] 1.1 In `GridCanvasComponent.drawGrid()`, replace the single white `strokeRect` for filled highlighted cells with two concentric rings: a dark outer ring (`#000000`, `lineWidth = 2`, inset 1 px) followed by a white inner ring (`#ffffff`, `lineWidth = 3`, inset 4 px); update the inline comment

