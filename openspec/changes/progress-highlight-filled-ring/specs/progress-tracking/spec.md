## MODIFIED Requirements

### Requirement: Progress highlights are rendered as an inset border on the canvas
The system SHALL render progress highlights as an inset border on the canvas. The border SHALL be clearly visible against both empty (white) and filled (black) cells without bleeding into adjacent cells.

On empty (white) cells the system SHALL draw a single teal-700 (`#0f766e`) inset ring, 3 px wide, inset 2 px from the cell boundary.

On filled (black) cells the system SHALL draw a double ring: a dark outer ring (`#000000`, 2 px, inset 1 px) to anchor the highlight to the cell boundary, followed by a white inner ring (`#ffffff`, 3 px, inset 4 px) as the primary highlight indicator.

#### Scenario: Highlighted empty cell renders correctly
- **WHEN** a cell that is not part of the pattern design is highlighted
- **THEN** the canvas SHALL display a teal-700 inset ring (3 px, inset 2 px) inside that cell's bounds on a white background

#### Scenario: Highlighted filled cell renders a double ring
- **WHEN** a cell that is filled in the pattern design is highlighted
- **THEN** the canvas SHALL display a dark outer ring (2 px, inset 1 px) and a white inner ring (3 px, inset 4 px) inside that cell's black filled area, such that the white ring is visually bounded and does not bleed into adjacent cells

