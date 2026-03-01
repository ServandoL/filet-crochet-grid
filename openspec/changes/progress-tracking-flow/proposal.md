## Why

Crafters using the app work from their physical pattern — they crochet row by row and need a way to track where they are in the pattern. The existing view mode shows the pattern read-only but offers no mechanism to mark progress. Without progress tracking, crafters must use physical markers (sticky notes, row counters) alongside the app, losing the value of the digital tool.

This change introduces a dedicated **Progress mode** that lets users tap rows, columns, and individual cells to mark them as complete. Progress is persisted to the backend so crafters can pick up exactly where they left off across sessions and devices.

## What Changes

- A new **`?mode=progress`** route variant of the existing `/patterns/:id` editor route
- A new **Progress button** on each pattern card in the pattern list
- A new **`PROGRESS` MongoDB collection** storing per-pattern progress state (highlighted cells), keyed by `patternId`
- Three new **backend API endpoints**: `GET`, `PUT`, and `DELETE` for `/api/patterns/:id/progress`
- A new **`ProgressSaveService`** on the frontend mirroring `PatternSaveService` (debounced auto-save + explicit save)
- Extended **`GridCanvasComponent`** to accept a `highlightedCells` input and render a teal inset border overlay on highlighted cells
- Extended **`GridRowHeadersComponent`** and **`GridColHeadersComponent`** to accept a `cellSize` override for larger touch targets in progress mode (min 44px)
- A **stale-progress warning banner** shown when `pattern.updatedAt > progress.updatedAt`
- A **"Clear All Progress"** button in the progress toolbar that calls `DELETE /api/patterns/:id/progress`

## Capabilities

### New Capabilities
- `progress-tracking`: Full progress tracking flow — tap rows, columns, and cells to mark completion; auto-save and explicit save; stale-progress warning; clear all progress action

### Modified Capabilities
- `pattern-list`: Add Progress button to each pattern card navigating to `?mode=progress`
- `grid-editor`: Add third mode (`progress`) with teal overlay rendering, larger touch targets, and progress toolbar

## Impact

**Backend:**
- New `progress` collection in MongoDB with `{ patternId, highlightedCells, updatedAt }` schema
- New routes in `patterns.controller.ts` (or new `progress.controller.ts`)
- New `ProgressService` in backend services
- New types: `DbProgress`, `ProgressDto` in `types.ts`
- New Zod schemas: `ProgressPatchSchema`

**Frontend:**
- `src/app/core/models/pattern.model.ts` — new `Progress`, `ProgressDto` interfaces
- `src/app/core/services/pattern-api.service.ts` — new `getProgress()`, `upsertProgress()`, `deleteProgress()` methods
- `src/app/features/editor/services/progress-save.service.ts` — new service
- `src/app/features/editor/models/progress-state.model.ts` — new `ProgressState` interface
- `src/app/features/editor/components/grid-canvas/` — new `highlightedCells` input
- `src/app/features/editor/components/grid-row-headers/` — new `progressMode` input for touch target sizing
- `src/app/features/editor/components/grid-col-headers/` — new `progressMode` input for touch target sizing
- `src/app/features/editor/grid-editor/` — new `isProgressMode` computed, parallel load of progress, progress toolbar
- `src/app/features/patterns/pattern-card/` — new Progress button

