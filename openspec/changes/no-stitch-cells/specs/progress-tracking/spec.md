## MODIFIED Requirements

### Requirement: User can highlight individual cells to mark progress
In progress mode, the system SHALL toggle a teal inset border highlight on a cell when the user taps or clicks it. Pattern cell fill state SHALL NOT change. No-stitch cells SHALL NOT be highlightable — tapping a no-stitch cell in progress mode SHALL have no effect.

#### Scenario: User taps an unhighlighted cell
- **WHEN** the user taps or clicks a cell that is not highlighted and is not a no-stitch cell
- **THEN** that cell SHALL gain a teal inset border highlight

#### Scenario: User taps a highlighted cell
- **WHEN** the user taps or clicks a cell that is already highlighted
- **THEN** that cell's highlight SHALL be removed

#### Scenario: Cell tap does not modify the pattern
- **WHEN** the user taps any cell in progress mode
- **THEN** the pattern's filled/unfilled state SHALL NOT change

#### Scenario: Tapping a no-stitch cell in progress mode has no effect
- **WHEN** the user taps or clicks a no-stitch cell in progress mode
- **THEN** no highlight SHALL be added and no state SHALL change

---

### Requirement: User can highlight an entire row by tapping its row number
In progress mode, the system SHALL apply Camp A fill-first logic to progress highlights when a row number button is tapped — operating only over **non-excluded** cells in the row. No-stitch cells SHALL be excluded from the Camp A count and SHALL NOT receive highlights.

#### Scenario: Tap row number on a row with no highlights (ignoring no-stitch cells)
- **WHEN** the user taps a row number whose non-excluded cells have no highlighted cells
- **THEN** all non-excluded cells in that row SHALL become highlighted

#### Scenario: Tap row number on a fully highlighted row (ignoring no-stitch cells)
- **WHEN** the user taps a row number whose every non-excluded cell is highlighted
- **THEN** all highlights in that row's non-excluded cells SHALL be removed

#### Scenario: Tap row number on a partially highlighted row (ignoring no-stitch cells)
- **WHEN** the user taps a row number whose non-excluded cells are partially highlighted
- **THEN** all remaining non-excluded unhighlighted cells in that row SHALL become highlighted

#### Scenario: No-stitch cells in a row are unaffected by row highlight
- **WHEN** the user taps a row number in progress mode and the row contains no-stitch cells
- **THEN** the no-stitch cells SHALL NOT receive a highlight and SHALL be excluded from the Camp A calculation

---

### Requirement: User can highlight an entire column by tapping its column number
In progress mode, the system SHALL apply Camp A fill-first logic to progress highlights when a column number button is tapped — operating only over **non-excluded** cells in the column.

#### Scenario: Tap column number on a column with no highlights (ignoring no-stitch cells)
- **WHEN** the user taps a column number whose non-excluded cells have no highlighted cells
- **THEN** all non-excluded cells in that column SHALL become highlighted

#### Scenario: Tap column number on a fully highlighted column (ignoring no-stitch cells)
- **WHEN** the user taps a column number whose every non-excluded cell is highlighted
- **THEN** all highlights in that column's non-excluded cells SHALL be removed

#### Scenario: Tap column number on a partially highlighted column (ignoring no-stitch cells)
- **WHEN** the user taps a column number whose non-excluded cells are partially highlighted
- **THEN** all remaining non-excluded unhighlighted cells in that column SHALL become highlighted

#### Scenario: No-stitch cells in a column are unaffected by column highlight
- **WHEN** the user taps a column number in progress mode and the column contains no-stitch cells
- **THEN** the no-stitch cells SHALL NOT receive a highlight and SHALL be excluded from the Camp A calculation

