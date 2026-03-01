## ADDED Requirements

### Requirement: User can log in with email and password
The system SHALL provide a login screen at `/login` where users authenticate with an email address and password. On successful authentication the system SHALL store the session token and redirect the user to `/patterns`.

#### Scenario: Successful login
- **WHEN** the user submits valid credentials on the login form
- **THEN** the system SHALL store the auth token and navigate to `/patterns`

#### Scenario: Invalid credentials
- **WHEN** the user submits an incorrect email or password
- **THEN** the system SHALL display an inline error message and SHALL NOT navigate away from `/login`

#### Scenario: Empty field submission
- **WHEN** the user submits the login form with one or both fields empty
- **THEN** the system SHALL display field-level validation errors and SHALL NOT call the auth API

---

### Requirement: Unauthenticated users are redirected to login
The system SHALL protect all routes under `/patterns` with an auth guard. Any navigation to a protected route by an unauthenticated user SHALL redirect to `/login`.

#### Scenario: Direct navigation to protected route while unauthenticated
- **WHEN** an unauthenticated user navigates directly to `/patterns` or `/patterns/:id`
- **THEN** the system SHALL redirect to `/login`

#### Scenario: Authenticated user accesses protected route
- **WHEN** an authenticated user navigates to `/patterns`
- **THEN** the system SHALL allow access and render the pattern list

---

### Requirement: Authenticated user can log out
The system SHALL provide a logout action accessible from the application. On logout the system SHALL clear the stored auth token and redirect the user to `/login`.

#### Scenario: User logs out
- **WHEN** the user triggers the logout action
- **THEN** the system SHALL clear the session, navigate to `/login`, and prevent back-navigation to protected routes

---

### Requirement: Login route redirects authenticated users away
The system SHALL redirect an already-authenticated user away from `/login` to `/patterns` so they are not shown the login form unnecessarily.

#### Scenario: Authenticated user visits /login
- **WHEN** an authenticated user navigates to `/login`
- **THEN** the system SHALL redirect to `/patterns`

