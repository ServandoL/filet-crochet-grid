## MODIFIED Requirements

### Requirement: Grid is rendered on a canvas with numbered headers
The system SHALL render the grid cells on a `<canvas>` element. Column numbers (X-axis) SHALL be rendered as a sticky DOM strip above the canvas. Row numbers (Y-axis) SHALL be rendered as a sticky DOM strip to the left of the canvas. Both header strips SHALL scroll-sync with the canvas when the user scrolls the grid. When the pattern has a non-zero `sectionRowInterval` or `sectionColInterval`, the canvas SHALL render a section tint overlay (alternating semi-transparent blocks) as the first draw pass, beneath all cell fills and grid lines.

#### Scenario: Grid renders on load
- **WHEN** the editor loads a pattern with R rows and C columns
- **THEN** the canvas SHALL display R × C cells, the column header SHALL show numbers 1 through C, and the row header SHALL show numbers 1 through R

#### Scenario: Headers stay visible on scroll
- **WHEN** the user scrolls the grid horizontally or vertically
- **THEN** the row number strip SHALL remain anchored to the left and the column number strip SHALL remain anchored to the top

#### Scenario: Section overlay is drawn beneath cell fills
- **WHEN** the pattern has a non-zero section interval and the canvas draws
- **THEN** the section tint blocks SHALL appear behind all cell fills, grid lines, and progress highlights

