## MODIFIED Requirements

### Requirement: Changes are auto-saved after a period of inactivity
The system SHALL automatically save the current pattern state to `PATCH /patterns/:id` after 2 seconds of inactivity following any cell state change or section interval change. The full set of filled cell positions, excluded cell positions, and the current `sectionRowInterval` and `sectionColInterval` values SHALL be sent on every save.

#### Scenario: User makes a change and stops editing
- **WHEN** the user toggles a cell or changes a section interval and makes no further changes for 2 seconds
- **THEN** the system SHALL call `PATCH /patterns/:id` with the full current `cells`, `excludedCells`, `sectionRowInterval`, and `sectionColInterval`

#### Scenario: User makes rapid changes
- **WHEN** the user makes multiple changes in quick succession within 2 seconds
- **THEN** the system SHALL debounce and send only one `PATCH` call 2 seconds after the last change

---

### Requirement: User can explicitly save via the Save button
The editor SHALL provide a Save button that immediately triggers a `PATCH /patterns/:id` call including `sectionRowInterval` and `sectionColInterval`, bypassing the debounce timer.

#### Scenario: User taps Save
- **WHEN** the user taps the Save button
- **THEN** the system SHALL immediately call `PATCH /patterns/:id` with the current `cells`, `excludedCells`, `sectionRowInterval`, and `sectionColInterval`

