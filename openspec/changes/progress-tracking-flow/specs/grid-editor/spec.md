## ADDED Requirements

### Requirement: Editor supports a third progress tracking mode
The editor SHALL accept `?mode=progress` as a valid mode value. In progress mode the pattern SHALL be displayed read-only and all highlight interactions SHALL operate on the progress overlay, not the pattern design.

#### Scenario: Editor loads in progress mode
- **WHEN** the user navigates to `/patterns/:id?mode=progress`
- **THEN** the editor SHALL load the pattern, fetch any saved progress, and render the grid with highlights overlaid. The pattern name SHALL be read-only. The Save and name-edit controls SHALL be replaced by progress-mode controls.

#### Scenario: Pattern cells are not interactive in progress mode
- **WHEN** the editor is in progress mode and the user taps a cell
- **THEN** the cell's pattern fill state SHALL NOT change; only the progress highlight SHALL toggle

---

### Requirement: Editor toolbar in progress mode mirrors edit mode save UX
In progress mode the toolbar SHALL display: a Back button, the read-only pattern name, a "Track Progress" badge, a stale-progress warning banner (when applicable), a dirty indicator, an explicit Save button, and a "Clear All Progress" button.

#### Scenario: Progress toolbar renders correctly
- **WHEN** the editor loads in progress mode
- **THEN** the toolbar SHALL show the pattern name (read-only), a teal "Track Progress" badge, and the Save and Clear All Progress buttons

#### Scenario: Save button triggers immediate progress save
- **WHEN** the user taps Save in progress mode
- **THEN** the system SHALL immediately call `PUT /api/patterns/:id/progress`

#### Scenario: Clear All Progress button is present in progress toolbar
- **WHEN** the editor is in progress mode
- **THEN** a "Clear All Progress" button SHALL be visible in the toolbar

---

### Requirement: Stale-progress warning banner is shown in the editor toolbar
When `pattern.updatedAt` is more recent than `progress.updatedAt` the editor toolbar SHALL display a dismissable amber warning banner.

#### Scenario: Stale warning shown on load
- **WHEN** the editor loads in progress mode and `pattern.updatedAt > progress.updatedAt`
- **THEN** an amber banner SHALL appear in the toolbar reading "Pattern was edited after your last progress save. Row or cell positions may have shifted." with a dismiss (×) button

#### Scenario: Stale warning dismissed
- **WHEN** the user taps the × button on the stale-progress banner
- **THEN** the banner SHALL be hidden for the remainder of the session

#### Scenario: No stale warning when progress is current
- **WHEN** the editor loads in progress mode and `progress.updatedAt >= pattern.updatedAt`
- **THEN** no stale-progress banner SHALL appear

