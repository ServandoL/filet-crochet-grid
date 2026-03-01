## MODIFIED Requirements

### Requirement: Editor supports a third progress tracking mode
The editor SHALL accept `?mode=progress` as a valid mode value. In progress mode the pattern SHALL be displayed read-only and all highlight interactions SHALL operate on the progress overlay, not the pattern design. Row and column header buttons SHALL use the same cell size as the canvas in all modes so that axis labels remain aligned with the grid.

#### Scenario: Editor loads in progress mode
- **WHEN** the user navigates to `/patterns/:id?mode=progress`
- **THEN** the editor SHALL load the pattern, fetch any saved progress, and render the grid with highlights overlaid. The pattern name SHALL be read-only. The Save and name-edit controls SHALL be replaced by progress-mode controls.

#### Scenario: Pattern cells are not interactive in progress mode
- **WHEN** the editor is in progress mode and the user taps a cell
- **THEN** the cell's pattern fill state SHALL NOT change; only the progress highlight SHALL toggle

#### Scenario: Row and column headers are aligned with the canvas in progress mode
- **WHEN** the editor is in progress mode
- **THEN** each row header button SHALL be exactly `cellSize` pixels tall and each column header button SHALL be exactly `cellSize` pixels wide, matching the canvas cell dimensions so that labels align with their corresponding rows and columns

