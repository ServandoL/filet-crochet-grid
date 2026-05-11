## MODIFIED Requirements

### Requirement: User can toggle a cell by clicking or tapping it
In edit mode with the **fill tool** active (default), the system SHALL toggle the fill state of a cell when the user clicks or taps it. An unfilled, non-excluded cell SHALL become filled (black). A filled cell SHALL become unfilled. Tapping a no-stitch cell while the fill tool is active SHALL have no effect. When the **no-stitch tool** is active, cell taps toggle no-stitch state instead — see the `no-stitch` capability spec for full semantics.

#### Scenario: User clicks an empty cell in edit mode (fill tool)
- **WHEN** the fill tool is active and the user clicks or taps an empty (not no-stitch) cell
- **THEN** the cell SHALL be filled with the default color (black)

#### Scenario: User clicks a filled cell in edit mode (fill tool)
- **WHEN** the fill tool is active and the user clicks or taps a filled cell
- **THEN** the cell SHALL become empty

#### Scenario: Tapping a no-stitch cell with the fill tool has no effect
- **WHEN** the fill tool is active and the user taps a no-stitch cell
- **THEN** the cell state SHALL NOT change

#### Scenario: Cells are not interactive in view mode
- **WHEN** the editor is in view mode and the user clicks or taps a cell
- **THEN** the cell state SHALL NOT change

---

### Requirement: Tapping a row number fills or clears the entire row
In edit mode with the **fill tool** active, tapping a row number SHALL apply the Camp A fill-first rule over **non-excluded** cells only: if the row has any non-excluded empty cells it SHALL fill them; if all non-excluded cells are already filled it SHALL clear them. No-stitch cells in the row SHALL be ignored by this operation. When the **no-stitch tool** is active, tapping a row number applies Camp A logic to no-stitch state instead — see the `no-stitch` capability spec.

#### Scenario: Tap row number on an empty row (fill tool)
- **WHEN** the fill tool is active and the user taps a row number whose row has no filled cells and some non-excluded cells
- **THEN** all non-excluded cells in that row SHALL become filled

#### Scenario: Tap row number on a fully filled row (fill tool)
- **WHEN** the fill tool is active and the user taps a row number whose row has every non-excluded cell filled
- **THEN** all non-excluded cells in that row SHALL become empty

#### Scenario: Tap row number on a partially filled row (fill tool)
- **WHEN** the fill tool is active and the user taps a row number whose row has some but not all non-excluded cells filled
- **THEN** all non-excluded empty cells in that row SHALL become filled

#### Scenario: No-stitch cells are skipped during row fill
- **WHEN** the fill tool is active and the user taps a row number on a row that contains no-stitch cells
- **THEN** the no-stitch cells SHALL remain unchanged and only non-excluded cells SHALL participate in the fill/clear operation

#### Scenario: Row headers are not interactive in view mode
- **WHEN** the editor is in view mode and the user taps a row number
- **THEN** no cell state SHALL change

---

### Requirement: Tapping a column number fills or clears the entire column
In edit mode with the **fill tool** active, tapping a column number SHALL apply the Camp A fill-first rule over **non-excluded** cells only. No-stitch cells in the column SHALL be ignored by this operation. When the **no-stitch tool** is active, tapping a column number applies Camp A logic to no-stitch state instead.

#### Scenario: Tap column number on an empty column (fill tool)
- **WHEN** the fill tool is active and the user taps a column number whose column has no filled cells and some non-excluded cells
- **THEN** all non-excluded cells in that column SHALL become filled

#### Scenario: Tap column number on a fully filled column (fill tool)
- **WHEN** the fill tool is active and the user taps a column number whose column has every non-excluded cell filled
- **THEN** all non-excluded cells in that column SHALL become empty

#### Scenario: Tap column number on a partially filled column (fill tool)
- **WHEN** the fill tool is active and the user taps a column number whose column has some but not all non-excluded cells filled
- **THEN** all non-excluded empty cells in that column SHALL become filled

#### Scenario: No-stitch cells are skipped during column fill
- **WHEN** the fill tool is active and the user taps a column number on a column that contains no-stitch cells
- **THEN** the no-stitch cells SHALL remain unchanged and only non-excluded cells SHALL participate in the fill/clear operation

#### Scenario: Column headers are not interactive in view mode
- **WHEN** the editor is in view mode and the user taps a column number
- **THEN** no cell state SHALL change

