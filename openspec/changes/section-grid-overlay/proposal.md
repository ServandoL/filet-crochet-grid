## Why

Large filet crochet patterns (200+ rows/cols) are difficult to navigate — at default zoom the user can only see ~30 rows at a time, making it hard to locate specific parts of the design. Users need a visual landmark system that divides the fine grid into larger, distinguishable blocks so they can orient themselves quickly while scrolling or tracking progress.

## What Changes

- **New section overlay on the canvas**: The canvas renders a "super-grid" of alternating lightly-tinted blocks at configurable row and column intervals, visible in all three editor modes (edit, view, progress). Tints are drawn at low opacity so cell fills remain fully readable.
- **Per-pattern section interval settings**: Two new integer fields — `sectionRowInterval` and `sectionColInterval` — are stored on the Pattern document. A value of `0` (default) disables the overlay entirely.
- **Section setter chip in the toolbar**: A compact `⊞ R × C` chip in the editor toolbar opens a small popover with two number inputs (row interval and column interval). The chip is visible in all three modes; inputs are read-only in view mode.
- **Section intervals included in save payload**: Both fields are included in auto-save and explicit save calls to `PATCH /patterns/:id`.

## Capabilities

### New Capabilities
- `section-grid-overlay`: The section overlay system — alternating tinted blocks rendered on the canvas, the toolbar setter chip/popover, and the interval configuration model.

### Modified Capabilities
- `grid-editor`: The editor toolbar gains the section setter chip visible in all modes.
- `pattern-save`: Pattern save payload gains `sectionRowInterval` and `sectionColInterval` fields.

## Impact

- **Frontend models**: `Pattern`, `UpdatePatternDto`, `GridState` gain `sectionRowInterval` and `sectionColInterval` (both `number`, default `0`).
- **Canvas renderer** (`grid-canvas.component.ts`): New draw pass before cell fills — alternating semi-transparent tinted rectangles at section block boundaries.
- **Grid editor** (`grid-editor.component.ts` + template): Section chip signal, popover open/close, interval inputs wired to `gridState`.
- **Pattern save service**: Include `sectionRowInterval` and `sectionColInterval` in PATCH payload.
- **Backend** (`types.ts`, `zod.schemas.ts`, `patterns.service.ts`): Two optional integer fields added to pattern schema (non-breaking, default `0`).
- **No migration required**: Existing patterns lacking the fields are treated as `0` (overlay off).

