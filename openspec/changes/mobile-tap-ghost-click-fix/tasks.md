## 1. Fix

- [x] 1.1 In `GridCanvasComponent.onTouchEnd()`, add `e.preventDefault()` inside the `dist < 8` tap branch to suppress the browser's synthetic `click` event

## 2. Tests

- [ ] 2.1 Add a unit test verifying that `onTouchEnd` calls `e.preventDefault()` when the touch displacement is less than 8 px
- [ ] 2.2 Add a unit test verifying that `onTouchEnd` does NOT call `e.preventDefault()` when the touch displacement is ≥ 8 px (drag, not tap)
- [ ] 2.3 Add a unit test verifying that `cellToggled` emits exactly once per simulated tap (no double emission when both `touchend` and `click` fire)

