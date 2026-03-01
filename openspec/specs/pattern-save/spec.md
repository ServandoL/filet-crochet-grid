## ADDED Requirements

### Requirement: Changes are auto-saved after a period of inactivity
The system SHALL automatically save the current pattern state to `PATCH /patterns/:id` after 2 seconds of inactivity following any cell state change. The full set of filled cell positions SHALL be sent on every save. Any in-flight auto-save request SHALL be cancelled if a new save is triggered before it completes.

#### Scenario: User makes a change and stops editing
- **WHEN** the user toggles a cell and makes no further changes for 2 seconds
- **THEN** the system SHALL call `PATCH /patterns/:id` with the full current cell state

#### Scenario: User makes rapid changes
- **WHEN** the user toggles multiple cells in quick succession within 2 seconds
- **THEN** the system SHALL debounce and send only one `PATCH` call 2 seconds after the last change, cancelling any previously in-flight request

---

### Requirement: User can explicitly save via the Save button
The editor SHALL provide a Save button that immediately triggers a `PATCH /patterns/:id` call, bypassing the debounce timer.

#### Scenario: User taps Save
- **WHEN** the user taps the Save button
- **THEN** the system SHALL immediately call `PATCH /patterns/:id` with the current cell state

---

### Requirement: Unsaved changes are indicated in the toolbar
The system SHALL display an unsaved-changes indicator in the editor toolbar whenever there are changes that have not yet been persisted to the API. The indicator SHALL be cleared after a successful save.

#### Scenario: Unsaved changes indicator appears after a cell change
- **WHEN** the user toggles a cell and the change has not yet been saved
- **THEN** an unsaved-changes indicator SHALL be visible in the toolbar

#### Scenario: Indicator clears after successful save
- **WHEN** a save (auto or explicit) completes successfully
- **THEN** the unsaved-changes indicator SHALL be removed from the toolbar

---

### Requirement: Save success and failure are communicated to the user
After a save attempt the system SHALL provide feedback. A successful save SHALL briefly show a "Saved" confirmation. A failed save SHALL show an error notification and SHALL retain the unsaved-changes indicator.

#### Scenario: Auto-save succeeds
- **WHEN** an auto-save completes successfully
- **THEN** the system SHALL briefly display a "Saved" confirmation and clear the unsaved indicator

#### Scenario: Save fails
- **WHEN** a save attempt (auto or explicit) receives an error response from the API
- **THEN** the system SHALL display a save-failure notification and keep the unsaved-changes indicator visible

---

### Requirement: Navigating away with unsaved changes prompts the user
When the user attempts to navigate away from the editor with unsaved changes, the system SHALL display a confirmation prompt. If the user confirms leaving, navigation SHALL proceed. If they cancel, they SHALL remain on the editor.

#### Scenario: User navigates away with unsaved changes and confirms
- **WHEN** the user taps Back (or otherwise triggers navigation) with unsaved changes and confirms leaving
- **THEN** the system SHALL navigate away without saving

#### Scenario: User navigates away with unsaved changes and cancels
- **WHEN** the user taps Back with unsaved changes and cancels the prompt
- **THEN** the system SHALL remain on the editor with all changes intact

