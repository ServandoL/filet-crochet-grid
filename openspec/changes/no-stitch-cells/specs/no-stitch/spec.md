## ADDED Requirements

### Requirement: Editor provides a No Stitch tool toggle
The editor toolbar SHALL display a tool selector with two options: "Fill" (default) and "No Stitch". The active tool SHALL determine what a cell tap or header tap does in edit mode. The tool toggle SHALL be visible only in edit mode.

#### Scenario: Fill tool is active by default
- **WHEN** the editor loads in edit mode
- **THEN** the Fill tool SHALL be selected and all cell interactions SHALL use fill semantics

#### Scenario: User switches to No Stitch tool
- **WHEN** the user taps the "No Stitch" button in the toolbar
- **THEN** the No Stitch tool SHALL become active and all subsequent cell and header interactions SHALL use no-stitch semantics

#### Scenario: User switches back to Fill tool
- **WHEN** the user taps the "Fill" button in the toolbar while No Stitch is active
- **THEN** the Fill tool SHALL become active again

---

### Requirement: No-stitch tool toggles the no-stitch state of individual cells
In edit mode with the no-stitch tool active, tapping a cell SHALL toggle its no-stitch state. Tapping an empty cell SHALL mark it as no-stitch. Tapping a no-stitch cell SHALL return it to empty. Tapping a filled cell SHALL remove it from the filled set and mark it as no-stitch.

#### Scenario: Tap empty cell with no-stitch tool
- **WHEN** the user taps an empty (not filled, not no-stitch) cell while the no-stitch tool is active
- **THEN** the cell SHALL become no-stitch (rendered gray)

#### Scenario: Tap no-stitch cell with no-stitch tool (toggle off)
- **WHEN** the user taps a no-stitch cell while the no-stitch tool is active
- **THEN** the cell SHALL return to empty (no-stitch state removed)

#### Scenario: Tap filled cell with no-stitch tool
- **WHEN** the user taps a filled cell while the no-stitch tool is active
- **THEN** the cell SHALL be removed from the filled set and become no-stitch (rendered gray)

---

### Requirement: No-stitch tool applies Camp A logic to entire rows via row header
In edit mode with the no-stitch tool active, tapping a row number SHALL apply Camp A fill-first logic to the no-stitch state of that row: if any cell in the row is not already no-stitch it SHALL mark all non-no-stitch cells as no-stitch; if every cell in the row is already no-stitch it SHALL remove the no-stitch state from all cells in that row (returning them to empty).

#### Scenario: Tap row header on a row with no no-stitch cells (no-stitch tool active)
- **WHEN** the no-stitch tool is active and the user taps a row number whose row has no no-stitch cells
- **THEN** all cells in that row SHALL become no-stitch

#### Scenario: Tap row header on a fully no-stitched row
- **WHEN** the no-stitch tool is active and the user taps a row number whose row has every cell marked as no-stitch
- **THEN** all no-stitch markings in that row SHALL be removed and cells SHALL return to empty

#### Scenario: Tap row header on a partially no-stitched row
- **WHEN** the no-stitch tool is active and the user taps a row number whose row has some but not all cells marked as no-stitch
- **THEN** all remaining non-no-stitch cells in that row SHALL become no-stitch (completing the row)

#### Scenario: Filled cells in a row become no-stitch when entire row is no-stitched
- **WHEN** the no-stitch tool is active and the user taps a row header, and some cells in that row are filled
- **THEN** those filled cells SHALL be removed from the filled set and become no-stitch

---

### Requirement: No-stitch tool applies Camp A logic to entire columns via column header
In edit mode with the no-stitch tool active, tapping a column number SHALL apply Camp A fill-first logic to the no-stitch state of that column.

#### Scenario: Tap column header on a column with no no-stitch cells (no-stitch tool active)
- **WHEN** the no-stitch tool is active and the user taps a column number whose column has no no-stitch cells
- **THEN** all cells in that column SHALL become no-stitch

#### Scenario: Tap column header on a fully no-stitched column
- **WHEN** the no-stitch tool is active and the user taps a column number whose column has every cell marked as no-stitch
- **THEN** all no-stitch markings in that column SHALL be removed and cells SHALL return to empty

#### Scenario: Tap column header on a partially no-stitched column
- **WHEN** the no-stitch tool is active and the user taps a column number whose column has some but not all cells marked as no-stitch
- **THEN** all remaining non-no-stitch cells in that column SHALL become no-stitch

---

### Requirement: No-stitch cells render as gray on the canvas
The canvas SHALL render no-stitch cells with a solid gray fill (`#9ca3af`) before filled cells and grid lines are drawn. No-stitch cells SHALL be visually distinct from both empty (white) and filled (black) cells in all editor modes (edit, view, progress).

#### Scenario: No-stitch cell renders gray in edit mode
- **WHEN** a cell is in the no-stitch state and the editor is in edit mode
- **THEN** the canvas SHALL display that cell with a solid gray fill (`#9ca3af`)

#### Scenario: No-stitch cell renders gray in view mode
- **WHEN** a cell is in the no-stitch state and the editor is in view mode
- **THEN** the canvas SHALL display that cell with a solid gray fill (`#9ca3af`)

#### Scenario: No-stitch cell renders gray in progress mode
- **WHEN** a cell is in the no-stitch state and the editor is in progress mode
- **THEN** the canvas SHALL display that cell with a solid gray fill (`#9ca3af`) and SHALL NOT receive any progress highlight overlay

---

### Requirement: No-stitch and fill states are mutually exclusive
A cell SHALL NOT be in both the filled set and the excluded set simultaneously. Setting a cell as no-stitch SHALL remove it from the filled set. Removing a cell from the no-stitch state SHALL return it to empty (not to any prior fill state).

#### Scenario: No-stitch takes precedence over fill
- **WHEN** a cell in the filled set is marked as no-stitch
- **THEN** the cell SHALL be removed from the filled set and added to the excluded set

#### Scenario: Un-no-stitching returns to empty
- **WHEN** a no-stitch cell's no-stitch state is removed
- **THEN** the cell SHALL become empty (not filled)

