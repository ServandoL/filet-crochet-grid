## Context

`GridRowHeadersComponent` and `GridColHeadersComponent` each have a `buttonSize` computed signal that inflates the button's layout dimension to `Math.max(cellSize, 44)` in Progress mode. The intent was to satisfy the WCAG 2.5.5 minimum touch-target size (44 × 44 CSS px). However, because `buttonSize` drives the CSS `height`/`width` of each button, inflating it also inflates the height/width of each slot in the header strip — misaligning it with the `<canvas>`, which always renders cells at `cellSize` (default 24 px). The mismatch compounds across rows/columns and is visible from the second row onwards.

## Goals / Non-Goals

**Goals:**
- Headers and canvas cells are always the same pixel size, in every mode
- No visible misalignment between the axis labels and the grid

**Non-Goals:**
- Achieving WCAG 2.5.5 (44 px) touch targets in this change — deferred until a proper solution (e.g. coordinating canvas cell size) is scoped
- Changing any template markup, inputs, outputs, or styles

## Decisions

### 1. Flatten `buttonSize` to always equal `cellSize()`

**Decision:** Replace `computed(() => this.progressMode() ? Math.max(this.cellSize(), 44) : this.cellSize())` with `computed(() => this.cellSize())` in both header components.

**Rationale:** The 44 px floor cannot be applied to layout size without also applying it to the canvas cell size — there is no CSS-only way to make a DOM button larger than its containing cell without breaking alignment. Since we are not ready to coordinate the canvas size change, the floor must be removed from layout entirely. Keeping `buttonSize` as a `computed` (rather than inlining `cellSize()` directly in the template) preserves the indirection point for a future revisit.

**Alternatives considered:**
- *Coordinate canvas cell size to 44 px in progress mode* — correct long-term solution, but changes the visual scale of the pattern significantly; deferred.
- *CSS `min-height`/`min-width` without affecting layout* — not possible with standard block-level buttons; expanding the hit area beyond the layout box requires absolute positioning tricks that add complexity with no alignment benefit.
- *Remove `buttonSize` entirely and use `cellSize()` in the template* — equivalent, but keeping the computed preserves a clear extension point.

## Risks / Trade-offs

- **Reduced touch target in progress mode** — at the default 24 px cell size, row/col header buttons are 24 × 40 px (width × height for rows; 40 × 24 for cols). This is below the WCAG 2.5.5 AAA threshold of 44 px. Acceptable short-term: no user reports exist for this issue, and the misalignment bug is more disruptive than the touch-target gap.
- **Regression test** — the existing behaviour of `buttonSize` in edit mode is unchanged (it already returned `cellSize()` unchanged for non-progress mode), so there is no edit-mode regression.

