## ADDED Requirements

### Requirement: Grid is rendered on a canvas with numbered headers
The system SHALL render the grid cells on a `<canvas>` element. Column numbers (X-axis) SHALL be rendered as a sticky DOM strip above the canvas. Row numbers (Y-axis) SHALL be rendered as a sticky DOM strip to the left of the canvas. Both header strips SHALL scroll-sync with the canvas when the user scrolls the grid.

#### Scenario: Grid renders on load
- **WHEN** the editor loads a pattern with R rows and C columns
- **THEN** the canvas SHALL display R × C cells, the column header SHALL show numbers 1 through C, and the row header SHALL show numbers 1 through R

#### Scenario: Headers stay visible on scroll
- **WHEN** the user scrolls the grid horizontally or vertically
- **THEN** the row number strip SHALL remain anchored to the left and the column number strip SHALL remain anchored to the top

---

### Requirement: User can toggle a cell by clicking or tapping it
In edit mode, the system SHALL toggle the fill state of a cell when the user clicks or taps it. An unfilled cell SHALL become filled (black). A filled cell SHALL become unfilled.

#### Scenario: User clicks an empty cell in edit mode
- **WHEN** the user clicks or taps an empty cell
- **THEN** the cell SHALL be filled with the default color (black)

#### Scenario: User clicks a filled cell in edit mode
- **WHEN** the user clicks or taps a filled cell
- **THEN** the cell SHALL become empty

#### Scenario: Cells are not interactive in view mode
- **WHEN** the editor is in view mode and the user clicks or taps a cell
- **THEN** the cell state SHALL NOT change

---

### Requirement: Tapping a row number fills or clears the entire row
In edit mode, tapping a row number SHALL apply the Camp A fill-first rule: if the row has any empty cells it SHALL fill all cells in that row; if all cells are already filled it SHALL clear all cells in that row.

#### Scenario: Tap row number on an empty row
- **WHEN** the user taps a row number whose row has no filled cells
- **THEN** all cells in that row SHALL become filled

#### Scenario: Tap row number on a fully filled row
- **WHEN** the user taps a row number whose row is completely filled
- **THEN** all cells in that row SHALL become empty

#### Scenario: Tap row number on a partially filled row
- **WHEN** the user taps a row number whose row has some but not all cells filled
- **THEN** all empty cells in that row SHALL become filled (completing the row)

#### Scenario: Row headers are not interactive in view mode
- **WHEN** the editor is in view mode and the user taps a row number
- **THEN** no cell state SHALL change

---

### Requirement: Tapping a column number fills or clears the entire column
In edit mode, tapping a column number SHALL apply the Camp A fill-first rule: if the column has any empty cells it SHALL fill all cells in that column; if all cells are already filled it SHALL clear all cells in that column.

#### Scenario: Tap column number on an empty column
- **WHEN** the user taps a column number whose column has no filled cells
- **THEN** all cells in that column SHALL become filled

#### Scenario: Tap column number on a fully filled column
- **WHEN** the user taps a column number whose column is completely filled
- **THEN** all cells in that column SHALL become empty

#### Scenario: Tap column number on a partially filled column
- **WHEN** the user taps a column number whose column has some but not all cells filled
- **THEN** all empty cells in that column SHALL become filled (completing the column)

#### Scenario: Column headers are not interactive in view mode
- **WHEN** the editor is in view mode and the user taps a column number
- **THEN** no cell state SHALL change

---

### Requirement: Desktop users navigate the grid by scrolling
On a non-touch device the system SHALL allow the user to scroll the grid container horizontally and vertically to reach all rows and columns.

#### Scenario: Grid overflows viewport on desktop
- **WHEN** the grid dimensions exceed the available viewport and the user scrolls
- **THEN** the grid SHALL scroll to reveal the offscreen cells while keeping headers sticky

---

### Requirement: Mobile users can pinch-to-zoom and pan the grid
On a touch device the system SHALL support pinch-to-zoom (two-finger pinch) to scale the canvas and two-finger drag to pan. A single-finger tap SHALL toggle cells. A single-finger drag SHALL scroll the container natively.

#### Scenario: Pinch-to-zoom on mobile
- **WHEN** the user performs a two-finger pinch gesture on the canvas
- **THEN** the canvas SHALL scale according to the pinch distance and the zoom level signal SHALL update accordingly

#### Scenario: Two-finger pan on mobile
- **WHEN** the user performs a two-finger drag on the canvas after zooming
- **THEN** the grid container SHALL pan to follow the gesture

#### Scenario: Single-finger tap on mobile toggles a cell
- **WHEN** the user taps a cell with a single finger without dragging
- **THEN** the cell fill state SHALL toggle

---

### Requirement: Editor displays the pattern name
The editor toolbar SHALL display the current pattern name. In view mode it SHALL be read-only. In edit mode it SHALL be editable inline.

#### Scenario: Pattern name displayed in editor
- **WHEN** the editor loads a pattern
- **THEN** the pattern name SHALL be visible in the toolbar

#### Scenario: User edits pattern name in edit mode
- **WHEN** the user edits the inline name field in edit mode and the change is saved
- **THEN** the updated name SHALL be persisted via the save mechanism

---

### Requirement: View mode disables all editing interactions
When the editor is opened with `?mode=view` the system SHALL render the grid in a read-only state. All cell, row header, and column header interactions SHALL be disabled. The Save button SHALL be hidden.

#### Scenario: Editor loads in view mode
- **WHEN** the user navigates to `/patterns/:id?mode=view`
- **THEN** the editor SHALL display the pattern without any interactive editing controls

---

### Requirement: User can navigate back to the pattern list from the editor
The editor toolbar SHALL include a Back navigation control that returns the user to `/patterns`.

#### Scenario: User taps Back in editor with no unsaved changes
- **WHEN** the user taps Back and there are no unsaved changes
- **THEN** the system SHALL navigate to `/patterns`

#### Scenario: User taps Back in editor with unsaved changes
- **WHEN** the user taps Back and there are unsaved changes
- **THEN** the system SHALL display a confirmation prompt warning of unsaved changes before navigating away

