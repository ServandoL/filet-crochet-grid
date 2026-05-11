## 1. Backend — Data Model & API

- [ ] 1.1 Add `excludedCells?: FilledCell[]` to `DbPattern` interface in `backend/src/types.ts`
- [ ] 1.2 Add `excludedCells?: FilledCell[]` to `UpdatePatternDto` interface in `backend/src/types.ts`
- [ ] 1.3 Add `excludedCells` optional field to `PatternPatchSchema` in `backend/src/zod.schemas.ts`
- [ ] 1.4 Update `patterns.service.ts` to include `excludedCells` when reading patterns from MongoDB (default `[]` if absent)
- [ ] 1.5 Update `patterns.service.ts` PATCH handler to persist `excludedCells` when provided in the update payload

## 2. Frontend — Data Models & API Service

- [ ] 2.1 Add `excludedCells?: FilledCell[]` to `Pattern` interface in `src/app/core/models/pattern.model.ts`
- [ ] 2.2 Add `excludedCells?: FilledCell[]` to `UpdatePatternDto` in `src/app/core/models/pattern.model.ts`
- [ ] 2.3 Add `excludedCells: Set<string>` to `GridState` interface in `src/app/features/editor/models/grid-state.model.ts`
- [ ] 2.4 Update `PatternApiService` save method to include `excludedCells` (serialised via `filledSetToArray`) in the PATCH payload

## 3. Grid Utilities

- [ ] 3.1 Update `toggleCell` in `src/app/features/editor/utils/grid.utils.ts` to accept `excludedCells: Set<string>` and skip no-stitch cells when the fill tool is active
- [ ] 3.2 Update `fillRow` to accept `excludedCells: Set<string>` and skip no-stitch cells in the Camp A calculation
- [ ] 3.3 Update `fillCol` to accept `excludedCells: Set<string>` and skip no-stitch cells in the Camp A calculation
- [ ] 3.4 Add `toggleNoStitch(pos, filledCells, excludedCells)` utility — removes from filled if present, toggles excluded
- [ ] 3.5 Add `noStitchRow(row, cols, filledCells, excludedCells)` utility — Camp A fill-first on excluded set for a row
- [ ] 3.6 Add `noStitchCol(col, rows, filledCells, excludedCells)` utility — Camp A fill-first on excluded set for a column

## 4. Canvas Renderer

- [ ] 4.1 Add `excludedCells` as a required input (`input.required<Set<string>>()`) to `GridCanvasComponent`
- [ ] 4.2 Register `excludedCells` as a reactive dependency in the `effect()` draw trigger
- [ ] 4.3 Add a no-stitch draw pass in `drawGrid()` — before filled cells, fill excluded cells with `#9ca3af`
- [ ] 4.4 Guard the progress highlight draw pass to skip cells present in `excludedCells`

## 5. Grid Editor — Tool State & Wiring

- [ ] 5.1 Add `activeTool = signal<'fill' | 'no-stitch'>('fill')` to `GridEditorComponent`
- [ ] 5.2 Initialise `gridState.excludedCells` from `pattern.excludedCells` (default empty Set) on pattern load
- [ ] 5.3 Pass `excludedCells` from `gridState` to `GridCanvasComponent` input
- [ ] 5.4 Route `cellToggled` event from `GridCanvasComponent` to `toggleNoStitch` when `activeTool()` is `'no-stitch'`, else existing `toggleCell`
- [ ] 5.5 Route `rowClicked` event to `noStitchRow` when `activeTool()` is `'no-stitch'`, else existing `fillRow` (updated to skip excluded)
- [ ] 5.6 Route `colClicked` event to `noStitchCol` when `activeTool()` is `'no-stitch'`, else existing `fillCol` (updated to skip excluded)
- [ ] 5.7 Include `excludedCells` in the save payload passed to `PatternSaveService` (auto-save and explicit save)

## 6. Progress Mode — No-Stitch Guard

- [ ] 6.1 In the progress-mode cell toggle handler in `GridEditorComponent`, guard against no-stitch cells — skip if `excludedCells` contains the tapped cell key
- [ ] 6.2 Update the progress-mode row highlight handler to exclude no-stitch cells from the Camp A calculation (pass `excludedCells` to row-highlight logic)
- [ ] 6.3 Update the progress-mode column highlight handler to exclude no-stitch cells from the Camp A calculation

## 7. Editor Toolbar — Tool Toggle UI

- [ ] 7.1 Add a tool toggle button group to the edit-mode toolbar in `grid-editor.component.html` — "Fill" and "No Stitch" buttons, with active state bound to `activeTool()`
- [ ] 7.2 Ensure each tool toggle button meets the 44 px minimum touch target (WCAG 2.5.5)
- [ ] 7.3 Add appropriate `aria-pressed` attributes to the tool toggle buttons reflecting `activeTool()`
- [ ] 7.4 Hide the tool toggle in view mode and progress mode (show only in edit mode)

## 8. Tests

- [ ] 8.1 Unit test `toggleNoStitch` — covers empty→no-stitch, no-stitch→empty, filled→no-stitch transitions
- [ ] 8.2 Unit test `noStitchRow` — covers Camp A logic: no exclusions, all excluded, partial, and filled-cells-in-row cases
- [ ] 8.3 Unit test `noStitchCol` — covers Camp A logic symmetrically
- [ ] 8.4 Unit test updated `fillRow` — verifies no-stitch cells are skipped in Camp A calculation
- [ ] 8.5 Unit test updated `fillCol` — verifies no-stitch cells are skipped in Camp A calculation

