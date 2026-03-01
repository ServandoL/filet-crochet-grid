## ADDED Requirements

### Requirement: User can enter progress tracking mode for a pattern
The system SHALL navigate to `/patterns/:id?mode=progress` when the user taps the Progress button on a pattern card. The editor SHALL load in progress mode, displaying the pattern read-only with progress highlights overlaid.

#### Scenario: User taps Progress on a pattern card
- **WHEN** the user taps the Progress button on a pattern card
- **THEN** the system SHALL navigate to `/patterns/:id?mode=progress`

#### Scenario: Editor loads in progress mode
- **WHEN** the user navigates to `/patterns/:id?mode=progress`
- **THEN** the editor SHALL display the pattern grid with all pattern cells visible, and any previously saved progress highlights rendered as a teal border overlay on each highlighted cell

#### Scenario: No prior progress exists
- **WHEN** the user enters progress mode for a pattern with no saved progress
- **THEN** the editor SHALL display the pattern with no highlights and an empty progress state

---

### Requirement: User can highlight individual cells to mark progress
In progress mode, the system SHALL toggle a teal inset border highlight on a cell when the user taps or clicks it. Pattern cell fill state SHALL NOT change.

#### Scenario: User taps an unhighlighted cell
- **WHEN** the user taps or clicks a cell that is not highlighted
- **THEN** that cell SHALL gain a teal inset border highlight

#### Scenario: User taps a highlighted cell
- **WHEN** the user taps or clicks a cell that is already highlighted
- **THEN** that cell's highlight SHALL be removed

#### Scenario: Cell tap does not modify the pattern
- **WHEN** the user taps any cell in progress mode
- **THEN** the pattern's filled/unfilled state SHALL NOT change

---

### Requirement: User can highlight an entire row by tapping its row number
In progress mode, the system SHALL apply Camp A fill-first logic to progress highlights when a row number button is tapped: if any cell in the row is unhighlighted it SHALL highlight all cells in that row; if all cells are already highlighted it SHALL remove all highlights in that row.

#### Scenario: Tap row number on a row with no highlights
- **WHEN** the user taps a row number whose row has no highlighted cells
- **THEN** all cells in that row SHALL become highlighted

#### Scenario: Tap row number on a fully highlighted row
- **WHEN** the user taps a row number whose row has every cell highlighted
- **THEN** all highlights in that row SHALL be removed

#### Scenario: Tap row number on a partially highlighted row
- **WHEN** the user taps a row number whose row has some but not all cells highlighted
- **THEN** all remaining cells in that row SHALL become highlighted (completing the row)

---

### Requirement: User can highlight an entire column by tapping its column number
In progress mode, the system SHALL apply Camp A fill-first logic to progress highlights when a column number button is tapped.

#### Scenario: Tap column number on a column with no highlights
- **WHEN** the user taps a column number whose column has no highlighted cells
- **THEN** all cells in that column SHALL become highlighted

#### Scenario: Tap column number on a fully highlighted column
- **WHEN** the user taps a column number whose column has every cell highlighted
- **THEN** all highlights in that column SHALL be removed

#### Scenario: Tap column number on a partially highlighted column
- **WHEN** the user taps a column number whose column has some but not all cells highlighted
- **THEN** all remaining cells in that column SHALL become highlighted

---

### Requirement: Progress highlights are rendered as a teal inset border on the canvas
The system SHALL render progress highlights as a 2 px teal border drawn 2 px inset from each cell's bounds on the canvas. The border SHALL be visible against both empty (white) and filled (black) cells.

#### Scenario: Highlighted empty cell renders correctly
- **WHEN** a cell that is not part of the pattern design is highlighted
- **THEN** the canvas SHALL display a teal inset border inside that cell's bounds on a white background

#### Scenario: Highlighted filled cell renders correctly
- **WHEN** a cell that is filled in the pattern design is highlighted
- **THEN** the canvas SHALL display a teal inset border inside that cell's black filled area

---

### Requirement: Row and column headers in progress mode have enlarged touch targets
In progress mode, each row and column header button SHALL have a minimum height and width of 44 px respectively, regardless of the current cell size, to meet WCAG 2.5.5 touch target requirements.

#### Scenario: Touch targets at default cell size
- **WHEN** the editor is in progress mode and the default cell size (24 px) is active
- **THEN** each row header button SHALL be at least 44 px tall and each column header button SHALL be at least 44 px wide

---

### Requirement: Progress is auto-saved and can be explicitly saved
The system SHALL auto-save progress using a 2-second debounce after the last highlight change. An explicit Save button SHALL be available to trigger an immediate save. A dirty indicator SHALL be shown when there are unsaved progress changes.

#### Scenario: Auto-save triggers after 2 seconds of inactivity
- **WHEN** the user taps a cell, row, or column and makes no further changes for 2 seconds
- **THEN** the system SHALL call `PUT /api/patterns/:id/progress` with the full current highlight state

#### Scenario: Explicit save
- **WHEN** the user taps the Save button in progress mode
- **THEN** the system SHALL immediately call `PUT /api/patterns/:id/progress` without waiting for the debounce

#### Scenario: Dirty indicator appears on unsaved changes
- **WHEN** the user makes a highlight change that has not yet been saved
- **THEN** the toolbar SHALL display an amber dot indicator

#### Scenario: Saved confirmation feedback
- **WHEN** a save completes successfully
- **THEN** the toolbar SHALL display "Saved ✓" briefly before returning to idle

---

### Requirement: Progress persists across sessions and devices
The system SHALL store progress in a backend database so the user can close the browser, return later, and resume from the same highlight state.

#### Scenario: User reopens progress mode after a prior session
- **WHEN** the user navigates to `/patterns/:id?mode=progress` having previously saved progress
- **THEN** the system SHALL fetch and display all previously saved highlights

---

### Requirement: System warns user when pattern was edited after last progress save
The system SHALL display a dismissable amber warning banner in the progress toolbar when `pattern.updatedAt` is more recent than `progress.updatedAt`.

#### Scenario: Pattern edited more recently than progress
- **WHEN** the user opens progress mode and the pattern was edited after the last progress save
- **THEN** the toolbar SHALL display: "Pattern was edited after your last progress save. Row or cell positions may have shifted." with a dismiss button

#### Scenario: User dismisses the stale-progress warning
- **WHEN** the user taps the dismiss button on the stale-progress warning
- **THEN** the warning banner SHALL be hidden for the remainder of the session

#### Scenario: No warning when progress is current
- **WHEN** the user opens progress mode and `progress.updatedAt >= pattern.updatedAt`
- **THEN** no stale-progress warning SHALL be shown

---

### Requirement: User can clear all progress for a pattern
The system SHALL provide a "Clear All Progress" button in the progress mode toolbar. Tapping it SHALL open a confirmation dialog. On confirmation, the system SHALL call `DELETE /api/patterns/:id/progress` and reset all highlights to empty.

#### Scenario: User taps Clear All Progress and confirms
- **WHEN** the user taps "Clear All Progress" and confirms in the dialog
- **THEN** the system SHALL call `DELETE /api/patterns/:id/progress`, remove all highlights from the canvas, and reset save state to idle

#### Scenario: User taps Clear All Progress and cancels
- **WHEN** the user taps "Clear All Progress" and cancels the dialog
- **THEN** the system SHALL close the dialog and leave all highlights intact

---

### Requirement: Unsaved progress triggers a confirmation prompt on navigation
The system SHALL display a browser-native confirm dialog when the user attempts to leave progress mode with unsaved highlight changes.

#### Scenario: User taps Back with unsaved progress
- **WHEN** the user taps Back in progress mode and there are unsaved highlight changes
- **THEN** the system SHALL prompt "You have unsaved changes. Leave without saving?" before navigating

#### Scenario: User taps Back with no unsaved progress
- **WHEN** the user taps Back in progress mode and there are no unsaved changes
- **THEN** the system SHALL navigate directly to `/patterns`

---

### Requirement: Progress is deleted when its parent pattern is deleted
The system SHALL cascade-delete the progress document when a pattern is deleted, to prevent orphaned progress records.

#### Scenario: Pattern deleted with existing progress
- **WHEN** a pattern is deleted via `DELETE /api/patterns/:id`
- **THEN** the associated progress document (if any) SHALL also be deleted from the `PROGRESS` collection

