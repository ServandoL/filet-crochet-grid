## Context

`drawGrid()` renders the progress overlay in a single pass over `highlighted`. Since `progress-border-visibility`, each cell branches on `filled.has(key)`:
- **Filled cell** → `strokeStyle = '#ffffff'`, `lineWidth = 3`, inset 2 px
- **Empty cell** → `strokeStyle = '#0f766e'`, `lineWidth = 3`, inset 2 px

The white ring on filled cells is visually correct inside the cell (21:1 on black) but its outer edge sits ≈ 0.5 px from the cell boundary, making it indistinguishable from the white canvas background of neighbouring cells.

## Goals / Non-Goals

**Goals:**
- Visually bound the white ring on filled cells so it does not bleed into adjacent white cells
- Keep the white ring as the primary highlight indicator on filled cells
- Change stays entirely inside the `drawGrid()` progress overlay block

**Non-Goals:**
- Changing the empty-cell ring (teal-700, already correct)
- Adding any new component inputs, outputs, or signals
- Changing the ring appearance at any specific zoom level

## Decisions

### 1. Dark outer halo before the white inner ring on filled cells

**Decision:** For each filled highlighted cell, draw two `strokeRect` calls:
1. `strokeStyle = '#000000'`, `lineWidth = 2`, inset 1 px — dark outer ring hugging the fill boundary
2. `strokeStyle = '#ffffff'`, `lineWidth = 3`, inset 4 px — white inner ring with clear black separation

**Geometry at `DEFAULT_CELL_SIZE = 24`:**
```
Cell boundary: 0px
Black fill starts: +1px
── dark outer ring centre: +2px (lineWidth 2 → occupies +1 to +3)
── white inner ring centre: +5.5px (lineWidth 3, inset 4 → occupies +2.5 to +7)
Cell interior: +7px inward
```
The dark outer ring is fully inside the black fill. The white ring is clearly separated from the cell boundary by the dark ring. Neither overflows into the grid line region.

**Rationale:** Drawing in fill order (dark first, white second) means the white ring sits on top of the dark ring's inner edge, creating a crisp boundary. No compositing tricks needed.

**Alternatives considered:**
- *Single white ring with `shadowBlur`* — Canvas `shadowBlur` is expensive (forces layer compositing on every draw), applies globally, and must be reset after every cell. Not appropriate for a hot draw loop.
- *Teal ring on filled cells instead of white* — Loses the contrast advantage on black; teal-700 on black is only ~4.15:1, barely passing AA and not perceptually prominent.
- *White gap + teal ring (Option D from explore)* — Achieves similar visual result with unified colour, but requires tuning the gap to be visible at 24 px cell size. Option A is more explicit and easier to reason about.

## Risks / Trade-offs

- **Two draw calls per filled highlighted cell** — at worst-case (all cells filled and highlighted on a 200×200 grid = 40 000 cells) this doubles the canvas draw calls for that subset. In practice, progress tracking involves tens to low hundreds of cells. Not a real performance concern.
- **Dark ring eats 3 px from cell edge** — at very small cell sizes (e.g. zoom 0.5 → effective 12 px) the double ring may look cramped. Acceptable: the 12 px case is already barely usable; no regression relative to current state.

