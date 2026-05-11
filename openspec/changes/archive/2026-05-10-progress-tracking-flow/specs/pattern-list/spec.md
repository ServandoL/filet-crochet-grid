## ADDED Requirements

### Requirement: Pattern card provides Progress action
Each pattern card SHALL include a Progress button that navigates to the grid editor in progress tracking mode.

#### Scenario: User taps Progress
- **WHEN** the user taps the Progress button on a pattern card
- **THEN** the system SHALL navigate to `/patterns/:id?mode=progress`

