## ADDED Requirements

### Requirement: Authenticated user sees their own patterns
The system SHALL display a list of patterns belonging to the authenticated user at `/patterns`. Patterns belonging to other users SHALL NOT be shown.

#### Scenario: User with existing patterns visits the list
- **WHEN** an authenticated user navigates to `/patterns`
- **THEN** the system SHALL fetch and display only that user's patterns, each as a card

#### Scenario: User with no patterns visits the list
- **WHEN** an authenticated user navigates to `/patterns` and has no saved patterns
- **THEN** the system SHALL display an empty-state message and a prominent call-to-action to create a new pattern

---

### Requirement: Pattern card shows name, dimensions, and last-edited date
Each pattern card SHALL display the pattern name, grid dimensions (rows × cols), and the date the pattern was last edited.

#### Scenario: Pattern card renders
- **WHEN** a pattern card is displayed
- **THEN** it SHALL show the pattern name, dimensions in the format "R × C", and a human-readable last-edited timestamp

---

### Requirement: Pattern card provides Edit action
Each pattern card SHALL include an Edit button that navigates to the grid editor in edit mode.

#### Scenario: User taps Edit
- **WHEN** the user taps the Edit button on a pattern card
- **THEN** the system SHALL navigate to `/patterns/:id?mode=edit`

---

### Requirement: Pattern card provides View action
Each pattern card SHALL include a View button that navigates to the grid editor in read-only view mode.

#### Scenario: User taps View
- **WHEN** the user taps the View button on a pattern card
- **THEN** the system SHALL navigate to `/patterns/:id?mode=view`

---

### Requirement: Pattern card provides Delete action with confirmation
Each pattern card SHALL include a Delete button. Tapping Delete SHALL open a confirmation dialog before any deletion occurs. The dialog SHALL clearly state the action is irreversible.

#### Scenario: User confirms delete
- **WHEN** the user taps Delete on a card and confirms in the dialog
- **THEN** the system SHALL call `DELETE /patterns/:id`, remove the card from the list, and SHALL NOT show a recovery option

#### Scenario: User cancels delete
- **WHEN** the user taps Delete on a card and cancels in the dialog
- **THEN** the system SHALL close the dialog and leave the pattern intact

#### Scenario: Delete API call fails
- **WHEN** the user confirms delete but the API returns an error
- **THEN** the system SHALL display an error notification and leave the pattern card in the list

---

### Requirement: Pattern card provides Progress action
Each pattern card SHALL include a Progress button that navigates to the grid editor in progress tracking mode.

#### Scenario: User taps Progress
- **WHEN** the user taps the Progress button on a pattern card
- **THEN** the system SHALL navigate to `/patterns/:id?mode=progress`

---

### Requirement: User can navigate to create a new pattern
The pattern list SHALL include a "New Pattern" button that navigates to `/patterns/new`.

#### Scenario: User taps New Pattern
- **WHEN** the user taps the New Pattern button
- **THEN** the system SHALL navigate to `/patterns/new`

