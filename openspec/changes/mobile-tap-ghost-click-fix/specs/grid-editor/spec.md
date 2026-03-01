## MODIFIED Requirements

### Requirement: Mobile users can pinch-to-zoom and pan the grid
On a touch device the system SHALL support pinch-to-zoom (two-finger pinch) to scale the canvas and two-finger drag to pan. A single-finger tap SHALL toggle cells exactly once. A single-finger drag SHALL scroll the container natively. The touch handler SHALL call `preventDefault()` on the `touchend` event for a recognised tap to suppress the browser's synthetic `click` event and prevent double-toggling.

#### Scenario: Pinch-to-zoom on mobile
- **WHEN** the user performs a two-finger pinch gesture on the canvas
- **THEN** the canvas SHALL scale according to the pinch distance and the zoom level signal SHALL update accordingly

#### Scenario: Two-finger pan on mobile
- **WHEN** the user performs a two-finger drag on the canvas after zooming
- **THEN** the grid container SHALL pan to follow the gesture

#### Scenario: Single-finger tap on mobile toggles a cell exactly once
- **WHEN** the user taps a cell with a single finger without dragging
- **THEN** the cell fill state SHALL toggle exactly once (the cell SHALL be filled if it was empty, or empty if it was filled)

#### Scenario: Single-finger tap does not fire a redundant click event
- **WHEN** the user taps a cell with a single finger on a mobile browser
- **THEN** only one `cellToggled` emission SHALL occur and the browser's synthetic `click` event SHALL be suppressed

