## ADDED Requirements

### Requirement: User creates a new pattern via a single form
The system SHALL provide a creation form at `/patterns/new` with three fields: pattern name (text), number of rows (integer), and number of columns (integer). Submitting the valid form SHALL call `POST /patterns`, then navigate to `/patterns/:id?mode=edit` using the ID returned by the API.

#### Scenario: User submits a valid form
- **WHEN** the user fills in a name and valid row/column counts and taps Create Pattern
- **THEN** the system SHALL call `POST /patterns` with the provided values, then navigate to the new pattern's editor in edit mode

#### Scenario: API returns error on creation
- **WHEN** the form is submitted but the API returns an error
- **THEN** the system SHALL display an error message on the form and SHALL NOT navigate away

---

### Requirement: Pattern name is required
The pattern name field SHALL be required. The form SHALL NOT submit with an empty name.

#### Scenario: Name field is empty on submit
- **WHEN** the user submits the form with the name field empty
- **THEN** the system SHALL display a "Name is required" validation error on the name field

---

### Requirement: Row and column counts are positive integers with a minimum value
The rows and columns fields SHALL each accept only positive integers. The minimum allowed value for each SHALL be 1. The form SHALL NOT submit if either value is missing, zero, negative, or non-integer.

#### Scenario: Invalid row count on submit
- **WHEN** the user submits the form with a row count of zero, a negative number, or a non-integer
- **THEN** the system SHALL display a validation error on the rows field

#### Scenario: Invalid column count on submit
- **WHEN** the user submits the form with a column count of zero, a negative number, or a non-integer
- **THEN** the system SHALL display a validation error on the columns field

---

### Requirement: User can cancel pattern creation
The creation form SHALL include a Cancel action that returns the user to `/patterns` without creating a pattern.

#### Scenario: User cancels creation
- **WHEN** the user activates the Cancel action on the creation form
- **THEN** the system SHALL navigate to `/patterns` and SHALL NOT call the create API

