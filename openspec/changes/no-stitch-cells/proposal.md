## Why

Filet crochet patterns are not always rectangular — doilies, shaped garments, and motifs often have corner or edge areas that fall entirely outside the crochet piece. Currently users have no way to mark those areas; they resort to filling corners with the regular filled-cell state and mentally distinguishing "real" stitches from "boundary markers." This conflation makes the pattern ambiguous and confusing to follow. Introducing a dedicated "no stitch" cell state eliminates that ambiguity.

## What Changes

- **New cell state — "No Stitch"**: A cell can now be empty, filled, or no-stitch. No-stitch cells render as gray and indicate an area outside the pattern shape.
- **No-stitch tool in the editor**: The editor toolbar gains a tool toggle: *Fill* (existing behavior) and *No Stitch* (new). The active tool determines what a cell or header tap does.
- **Row/column header support for no-stitch tool**: When the no-stitch tool is active, tapping a row or column header applies Camp A fill-first logic to no-stitch state — same mechanics as the existing fill-row/fill-column flow.
- **No-stitch cells excluded from progress tracking**: Highlighted-cell interactions and progress highlights are blocked on no-stitch cells; they represent areas that are never crocheted.
- **No-stitch cells excluded from fill-row/fill-column in fill tool**: When the fill tool is active and the user taps a row/column header, no-stitch cells are skipped.
- **Persistence**: `excludedCells` is stored on the Pattern document (frontend model, backend DB, and API wire format), so no-stitch zones survive page reloads and device changes.

## Capabilities

### New Capabilities
- `no-stitch`: The no-stitch cell state — rendering, interaction mechanics, tool toggle UX, and exclusion from fill/progress flows.

### Modified Capabilities
- `grid-editor`: Editor toolbar gains the tool toggle (Fill / No Stitch); row/column header interaction changes to respect the active tool; cell tap behavior depends on active tool.
- `pattern-save`: Pattern model and API contract gain `excludedCells: FilledCell[]`; backend schema and Zod validators updated accordingly.
- `progress-tracking`: No-stitch cells are not highlightable; progress state must ignore excluded cells on load and on interaction.

## Impact

- **Frontend models**: `Pattern`, `UpdatePatternDto`, `GridState` gain `excludedCells`.
- **Canvas renderer** (`grid-canvas.component.ts`): New draw pass for no-stitch cells (gray fill); progress highlight skips no-stitch cells.
- **Grid utils** (`grid.utils.ts`): `fillRow` / `fillCol` skip no-stitch cells; new `toggleNoStitch`, `noStitchRow`, `noStitchCol` utilities.
- **Grid editor** (`grid-editor.component.ts`): Active tool signal; route inputs / save payloads updated.
- **Row/column header components**: Emit events whether in fill or no-stitch context (or the parent can route based on active tool).
- **Backend** (`patterns.service.ts`, `zod.schemas.ts`, `types.ts`): `excludedCells` field added to pattern create/update schema and DB model.
- **Pattern API service**: Include `excludedCells` in save payloads.
- **Progress mode**: Interaction guard checks no-stitch state before toggling highlights.

