## Context

The canvas renders a `<canvas>` element sized to `cols × cellSize` by `rows × cellSize` pixels. At 24 px default cell size a 200×200 pattern produces a 4,800×4,800 px canvas — only ~30 rows are visible in a typical mobile viewport at a time. The draw pipeline currently renders: background fill → filled cells → grid lines → progress highlights.

Two new integers on the Pattern document (`sectionRowInterval`, `sectionColInterval`) control whether and how often section boundaries appear. A value of `0` means the overlay is off. The toolbar shows a `⊞ R × C` chip that opens a two-field popover for the user to set these values.

## Goals / Non-Goals

**Goals:**
- Render alternating lightly-tinted rectangular blocks on the canvas at configurable row/column intervals.
- Visible in edit, view, and progress modes with no dedicated interaction.
- Per-pattern settings persisted with the pattern document.
- Toolbar chip that opens inline popover — read-only in view mode.

**Non-Goals:**
- Named or labeled sections.
- Tap-to-navigate / scroll-jump behavior.
- Irregular (non-uniform) section boundaries.
- Section visibility toggle separate from setting the interval to 0.

## Decisions

### 1. Alternating checkerboard tint (Treatment B)

**Decision**: Alternate between two tint colors — a subtle warm gray (`rgba(156, 163, 175, 0.10)`, gray-400 at 10%) and transparent — in a checkerboard pattern across super-grid blocks. The tint is drawn before any cell fills so filled/empty cells remain fully readable.

**Rationale**: Bold lines alone still require the eye to count. Alternating fills make each macro-block visually distinct at a glance. 10% opacity is low enough to be invisible against empty cells at a casual glance, yet perceptible enough to delineate blocks.

**Alternative considered**: A single-color border line at each interval. Rejected — less distinct and harder to read on dense patterns.

---

### 2. Two independent intervals (`sectionRowInterval`, `sectionColInterval`)

**Decision**: Row and column intervals are independent integers. `0` = off for that axis. Default is `0` (overlay disabled).

**Rationale**: Filet crochet repeats are not always square — a 10-row, 15-col repeat is common. Independent axes give the user precise control without forcing square blocks.

---

### 3. Section intervals stored on Pattern (not as a session preference)

**Decision**: `sectionRowInterval: number` and `sectionColInterval: number` are stored on the Pattern document and sent in every PATCH save.

**Rationale**: The natural section size is a property of the pattern's repeat structure, not the user's display preference. The same user opening the same pattern on a different device should see the same grid overlay.

**Alternative considered**: App-level localStorage preference (same intervals for all patterns). Rejected — different patterns have different repeat sizes.

---

### 4. Toolbar chip with inline popover (no modal)

**Decision**: A `⊞ R × C` chip in the toolbar row. Tapping/clicking opens a small inline popover directly below the chip with two number inputs (row interval, col interval) and a close button. Changes apply immediately (no submit button) and dirty-flag the pattern for save. In view mode the chip shows the current values but inputs are disabled.

**Rationale**: A full modal dialog is heavy UX for two numbers. An inline popover keeps the user in context. Immediate application (no submit) matches the existing name-edit UX pattern.

---

### 5. Canvas draw order

**Decision**: Background → **section tint blocks** → filled cells → grid lines → progress highlights.

**Rationale**: Section tints must sit below cell fills so the pattern design is always the dominant visual. Grid lines on top of tints keep cell boundaries crisp. Progress highlights remain the topmost layer.

---

### 6. Backend fields are additive and optional (no migration)

**Decision**: Both fields are optional in the Zod schema with `.default(0)`. MongoDB documents without the fields read as 0.

**Rationale**: Non-breaking — existing patterns simply have the overlay off until the user sets it.

## Risks / Trade-offs

- **Performance on very large grids**: At 200×200 with a 10×10 interval, the tint pass draws 400 rectangles per frame. `fillRect` on canvas is GPU-accelerated; 400 calls is negligible.
- **Contrast with no-stitch cells**: No-stitch cells render as `#9ca3af` (gray-400 solid). The tint (`gray-400 @ 10%`) is nearly invisible on top, which is the desired behavior — no-stitch cells should stay visually dominant.
- **Toolbar crowding**: The toolbar already carries Back / name / mode badge / dirty dot / Save / Clear. Adding a section chip must not overflow on small screens. The chip is small (`⊞ 10×10`, ~60px) and can be placed after the mode badge, before the save controls.

## Open Questions

- Should the chip be hidden entirely in view mode (since inputs are read-only), or shown as informational? → Show as read-only — users opening a pattern in view mode benefit from seeing the section grid the author configured.

