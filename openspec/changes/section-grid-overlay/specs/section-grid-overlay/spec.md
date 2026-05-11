## ADDED Requirements

### Requirement: Canvas renders alternating tinted section blocks at configurable intervals
When a pattern has a non-zero `sectionRowInterval` or `sectionColInterval`, the canvas SHALL render alternating semi-transparent tinted rectangles forming a checkerboard of macro-blocks before drawing cell fills. The tint color SHALL be `rgba(156, 163, 175, 0.10)` (gray-400 at 10% opacity) on every other block in a checkerboard arrangement; alternate blocks SHALL be transparent. The tint pass SHALL be visible in edit, view, and progress modes.

#### Scenario: Section overlay renders when both intervals are set
- **WHEN** a pattern has `sectionRowInterval = R` and `sectionColInterval = C` (both > 0) and the canvas draws
- **THEN** the canvas SHALL divide the grid into macro-blocks of R rows × C cols and fill alternating blocks with the tint color in a checkerboard pattern

#### Scenario: Section overlay renders with row interval only
- **WHEN** a pattern has `sectionRowInterval = R` (> 0) and `sectionColInterval = 0`
- **THEN** the canvas SHALL render alternating horizontal bands of R rows with the tint color

#### Scenario: Section overlay renders with column interval only
- **WHEN** a pattern has `sectionColInterval = C` (> 0) and `sectionRowInterval = 0`
- **THEN** the canvas SHALL render alternating vertical bands of C cols with the tint color

#### Scenario: Section overlay is hidden when both intervals are zero
- **WHEN** a pattern has `sectionRowInterval = 0` and `sectionColInterval = 0`
- **THEN** no tint overlay SHALL be drawn and the canvas SHALL appear as before

#### Scenario: Cell fills render on top of the section tint
- **WHEN** the section overlay is active and cells are filled or in no-stitch state
- **THEN** the cell fills SHALL be drawn on top of the tint, fully visible and unaffected by the overlay

#### Scenario: Section overlay is visible in progress mode
- **WHEN** the editor is in progress mode and the pattern has a non-zero section interval
- **THEN** the section tint overlay SHALL be visible beneath the progress highlight rings

---

### Requirement: Editor toolbar shows a section setter chip in all modes
The editor toolbar SHALL display a compact section chip showing the current intervals in the format `⊞ R × C` (e.g., `⊞ 10 × 10`). When both intervals are zero the chip SHALL display `⊞ Off`. Tapping or clicking the chip SHALL open a small inline popover with two number inputs — "Every _ rows" and "Every _ cols" — and a close button. The popover SHALL be dismissed by tapping the close button, tapping the chip again, or clicking outside. In view mode the chip SHALL be shown but the inputs SHALL be disabled.

#### Scenario: Chip displays current intervals
- **WHEN** the editor loads a pattern with `sectionRowInterval = 10` and `sectionColInterval = 15`
- **THEN** the toolbar SHALL display a chip reading `⊞ 10 × 15`

#### Scenario: Chip displays Off when intervals are zero
- **WHEN** the editor loads a pattern with both intervals set to `0`
- **THEN** the toolbar chip SHALL read `⊞ Off`

#### Scenario: Tapping chip opens popover
- **WHEN** the user taps the section chip
- **THEN** a popover SHALL appear with two number inputs pre-filled with the current row and column intervals

#### Scenario: Changing row interval updates the overlay immediately
- **WHEN** the user changes the "Every _ rows" input in the popover
- **THEN** the canvas SHALL immediately re-render with the new row interval and the chip label SHALL update

#### Scenario: Changing column interval updates the overlay immediately
- **WHEN** the user changes the "Every _ cols" input in the popover
- **THEN** the canvas SHALL immediately re-render with the new column interval and the chip label SHALL update

#### Scenario: Interval changes dirty-flag the pattern
- **WHEN** the user changes either interval in the popover
- **THEN** the pattern SHALL be marked as having unsaved changes (dirty indicator appears)

#### Scenario: Inputs are disabled in view mode
- **WHEN** the editor is in view mode and the user taps the section chip
- **THEN** the popover SHALL open but both number inputs SHALL be disabled and non-editable

#### Scenario: Popover is accessible
- **WHEN** the section popover is open
- **THEN** focus SHALL move into the popover, the popover SHALL be labelled as a dialog, and pressing Escape or the close button SHALL dismiss it and return focus to the chip

#### Scenario: Setting an interval to zero disables that axis
- **WHEN** the user sets "Every _ rows" to `0` in the popover
- **THEN** the row-interval tint bands SHALL be removed and only the column-interval bands (if any) SHALL remain

