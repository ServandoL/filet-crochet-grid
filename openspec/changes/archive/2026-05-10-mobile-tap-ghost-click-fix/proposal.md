## Why

On mobile browsers, a single tap on a grid cell toggles the cell twice — filling it and immediately unfilling it — making the grid appear unresponsive. This is caused by the browser firing both a `touchend` event (handled by the custom touch listener) and a synthetic `click` event (handled by the Angular `(click)` binding) for the same gesture, resulting in two `cellToggled` emissions from one tap.

## What Changes

- In `GridCanvasComponent.onTouchEnd()`, call `e.preventDefault()` inside the tap branch (distance < 8 px) to suppress the browser's synthetic `click` event after a touch tap, preventing the double-toggle.

## Capabilities

### New Capabilities
<!-- None — this is a bug fix with no new user-facing capability -->

### Modified Capabilities
- `grid-editor`: The requirement "Single-finger tap on mobile toggles a cell" was already specified but was broken in practice. The fix restores the correct behavior: exactly one toggle per tap.

## Impact

- **File**: `src/app/features/editor/components/grid-canvas/grid-canvas.component.ts`
- **Method**: `onTouchEnd()`
- **Change**: One-line addition of `e.preventDefault()` in the tap branch
- **Desktop behavior**: Unaffected — `e.preventDefault()` on `touchend` does not suppress mouse events on non-touch devices
- **Pinch-to-zoom**: Unaffected — handled by `onTouchMove()`, a separate code path
- **Dependencies**: None

