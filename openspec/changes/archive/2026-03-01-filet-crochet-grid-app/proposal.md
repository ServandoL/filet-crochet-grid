## Why

Filet crochet crafters need a dedicated digital tool to design, save, and reference their grid patterns. Today there is no purpose-built web app for this — crafters resort to graph paper, spreadsheets, or generic pixel-art tools that don't match the filet crochet workflow.

## What Changes

- Introduce a login-gated personal pattern library where users see only their own saved patterns
- Introduce a pattern creation flow: a single form (name + grid dimensions) that launches a canvas-based grid editor
- Introduce a canvas-based grid editor supporting 200+ row/column grids with click/tap cell toggling, row-fill and column-fill via header taps, and sticky frozen-pane headers
- Introduce read-only view mode for patterns alongside full edit mode
- Introduce auto-save (debounced 2 s) plus explicit save, with unsaved-changes guard on navigation
- Introduce hard-delete with a confirmation dialog from the pattern list

## Capabilities

### New Capabilities

- `auth`: Login screen and auth guard protecting all pattern routes; users see only their own data
- `pattern-list`: Authenticated landing page listing the user's patterns with Edit, View, and Delete actions
- `pattern-create`: Shape-B creation form (name + rows + cols) that navigates to the editor on submit
- `grid-editor`: Canvas-based grid editor for 200+ grids; cell toggle, row/column header fill, frozen-pane sticky headers, scroll on desktop, pinch-to-zoom + pan on mobile, edit/view mode switching
- `pattern-save`: Auto-save with 2 s debounce + explicit Save button; unsaved-changes warning on back navigation; PATCH full sparse-cell state to backend API

### Modified Capabilities

## Impact

- **New routes**: `/login`, `/patterns`, `/patterns/new`, `/patterns/:id`
- **New Angular feature modules / components**: `AuthComponent`, `PatternListComponent`, `PatternCreateComponent`, `GridEditorComponent`, `GridCanvasDirective`, `PatternSaveService`
- **State management**: Angular signals + computed for grid cell state (sparse `Set<string>` of `"row,col"` keys)
- **Rendering**: `<canvas>` element for grid body; DOM strips for row/column headers
- **API surface (backend, not implemented here)**: `POST /patterns`, `GET /patterns`, `GET /patterns/:id`, `PATCH /patterns/:id`, `DELETE /patterns/:id`
- **Dependencies**: No new third-party libraries required; Tailwind CSS (already installed) covers styling

