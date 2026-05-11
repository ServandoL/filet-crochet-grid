## MODIFIED Requirements

### Requirement: Changes are auto-saved after a period of inactivity
The system SHALL automatically save the current pattern state to `PATCH /patterns/:id` after 2 seconds of inactivity following any cell state change (fill toggle or no-stitch toggle). The full set of filled cell positions AND the full set of excluded cell positions SHALL be sent on every save. Any in-flight auto-save request SHALL be cancelled if a new save is triggered before it completes.

#### Scenario: User makes a change and stops editing
- **WHEN** the user toggles a cell (fill or no-stitch) and makes no further changes for 2 seconds
- **THEN** the system SHALL call `PATCH /patterns/:id` with the full current `cells` and `excludedCells` arrays

#### Scenario: User makes rapid changes
- **WHEN** the user toggles multiple cells in quick succession within 2 seconds
- **THEN** the system SHALL debounce and send only one `PATCH` call 2 seconds after the last change, cancelling any previously in-flight request

---

### Requirement: User can explicitly save via the Save button
The editor SHALL provide a Save button that immediately triggers a `PATCH /patterns/:id` call with the full current `cells` and `excludedCells` arrays, bypassing the debounce timer.

#### Scenario: User taps Save
- **WHEN** the user taps the Save button
- **THEN** the system SHALL immediately call `PATCH /patterns/:id` with the current `cells` and `excludedCells` arrays

