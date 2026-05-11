## 1. Backend — Data Model & API

- [x] 1.1 Add `sectionRowInterval?: number` and `sectionColInterval?: number` to `DbPattern` interface in `backend/src/types.ts`
- [x] 1.2 Add `sectionRowInterval?: number` and `sectionColInterval?: number` to `UpdatePatternDto` interface in `backend/src/types.ts`
- [x] 1.3 Add `sectionRowInterval` and `sectionColInterval` as optional integer fields with `.default(0)` to `PatternPatchSchema` in `backend/src/zod.schemas.ts`
- [x] 1.4 Update `patterns.service.ts` to include both fields when reading patterns from MongoDB (default `0` if absent)
- [x] 1.5 Update `patterns.service.ts` PATCH handler to persist both fields when provided in the update payload

## 2. Frontend — Data Models & API Service

- [x] 2.1 Add `sectionRowInterval?: number` and `sectionColInterval?: number` to `Pattern` interface in `src/app/core/models/pattern.model.ts`
- [x] 2.2 Add both fields to `UpdatePatternDto` in `src/app/core/models/pattern.model.ts`
- [x] 2.3 Add `sectionRowInterval: number` and `sectionColInterval: number` to `GridState` interface in `src/app/features/editor/models/grid-state.model.ts`
- [x] 2.4 Update `PatternApiService` save method to include both interval fields in the PATCH payload

## 3. Canvas Renderer — Section Tint Draw Pass

- [x] 3.1 Add `sectionRowInterval` input (`input<number>(0)`) to `GridCanvasComponent`
- [x] 3.2 Add `sectionColInterval` input (`input<number>(0)`) to `GridCanvasComponent`
- [x] 3.3 Register both inputs as reactive dependencies in the `effect()` draw trigger
- [x] 3.4 Implement the section tint draw pass in `drawGrid()` as the first draw step (before background fill):  iterate over super-grid block positions and `fillRect` alternate blocks with `rgba(156, 163, 175, 0.10)`; skip if both intervals are `0`

## 4. Grid Editor — State Wiring

- [x] 4.1 Initialise `gridState.sectionRowInterval` and `gridState.sectionColInterval` from the loaded pattern (default `0`) in `GridEditorComponent.ngOnInit()`
- [x] 4.2 Pass `sectionRowInterval` and `sectionColInterval` from `gridState` to `GridCanvasComponent` inputs
- [x] 4.3 Include both interval values in the save payload passed to `PatternSaveService` (auto-save and explicit save)

## 5. Toolbar — Section Setter Chip & Popover

- [x] 5.1 Add `sectionPopoverOpen = signal(false)` to `GridEditorComponent`
- [x] 5.2 Add the section chip button to the toolbar in `grid-editor.component.html` — displays `⊞ R × C` or `⊞ Off` based on current intervals; visible in all three modes
- [x] 5.3 Implement the inline popover beneath the chip with two `<input type="number" min="0">` fields — "Every _ rows" and "Every _ cols" — and a close (✕) button
- [x] 5.4 Wire the row interval input to update `gridState.sectionRowInterval` on change and dirty-flag the pattern
- [x] 5.5 Wire the column interval input to update `gridState.sectionColInterval` on change and dirty-flag the pattern
- [x] 5.6 Disable both inputs when the editor is in view mode (`!isEditMode() && !isProgressMode()`)
- [x] 5.7 Implement popover dismiss on Escape key, click-outside, and close button; return focus to chip on dismiss
- [x] 5.8 Add `role="dialog"`, `aria-label`, and `aria-modal="true"` to the popover for accessibility
- [x] 5.9 Ensure the chip and popover inputs each meet the 44 px minimum touch target (WCAG 2.5.5)

## 6. Tests

- [x] 6.1 Unit test the section tint draw pass — verify `fillRect` is called for the correct alternating blocks when both intervals are set, when only one is set, and when both are zero
- [x] 6.2 Unit test interval-zero edge case — no tint drawn when `sectionRowInterval = 0` and `sectionColInterval = 0`
- [x] 6.3 Unit test chip label computation — `⊞ 10 × 15`, `⊞ Off`, mixed (`⊞ 10 × 0` → shows only row interval active)

