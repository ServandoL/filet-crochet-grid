## Context

`GridCanvasComponent` handles both mouse and touch input. Mouse clicks are handled declaratively via an Angular `(click)` binding on the `<canvas>` element. Touch gestures (single-finger tap, pinch-to-zoom) are handled imperatively via `addEventListener` in `setupTouchListeners()`, called in `afterNextRender`.

On mobile browsers the touch event sequence for a single finger tap is:
1. `touchstart`
2. `touchend` → `onTouchEnd()` fires, detects a tap (displacement < 8 px), emits `cellToggled`
3. `click` (synthesized by the browser ~300 ms later, or immediately on modern mobile browsers) → `onCanvasClick()` fires, emits `cellToggled` again

The double emission toggles the cell twice, leaving its state unchanged. The `touch-action: none` CSS on the wrapper div prevents scroll/pan interference but does not suppress synthetic click generation.

## Goals / Non-Goals

**Goals:**
- Ensure exactly one `cellToggled` emission per single-finger tap on mobile
- Preserve existing desktop mouse-click behavior unchanged
- Preserve existing pinch-to-zoom behavior unchanged

**Non-Goals:**
- Refactoring touch and mouse input to use the Pointer Events API (could be done later but is a larger change)
- Supporting multi-touch tap gestures

## Decisions

### Decision 1: Call `e.preventDefault()` on `touchend` inside the tap branch

When `e.preventDefault()` is called on a `touchend` event, the browser skips generating the subsequent synthetic `click` event. This is the spec-defined mechanism for exactly this scenario.

**Alternatives considered:**

| Alternative | Reason rejected |
|---|---|
| Remove the `(click)` binding and handle all input via touch only | Breaks desktop mouse interaction entirely |
| Add a boolean flag (`lastEventWasTouch`) to skip `onCanvasClick` when touch fired recently | Fragile — timing-dependent, requires cleanup, non-deterministic in edge cases |
| Switch to Pointer Events API (`pointerdown`/`pointerup`) | Correct long-term direction, but requires a larger refactor of all touch logic including pinch-to-zoom; disproportionate scope for a one-line bug fix |
| `touch-action: none` (already present) | Controls browser pan/scroll handling, not synthetic click generation |

`e.preventDefault()` in `touchend` is the smallest, most reliable, and most widely supported fix. It is the same pattern already used in `onTouchMove` for the pinch-to-zoom path.

## Risks / Trade-offs

- **[Risk] `e.preventDefault()` suppresses other default touchend behaviors** → For a `<canvas>` element with `touch-action: none` already set, the only default behavior being suppressed is synthetic click generation. There are no other relevant defaults on this element.
- **[Risk] Future browsers may not synthesize clicks after touchend** → This is not a risk: if the browser stops synthesizing clicks, removing `preventDefault()` would have no effect; the fix is neutral in that scenario.

## Migration Plan

Single file change — no migration needed. Deployed as a normal build.

