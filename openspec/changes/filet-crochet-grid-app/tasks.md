## 1. Project Foundation

- [x] 1.1 Update `openspec/config.yaml` with project context (tech stack, conventions, domain)
- [x] 1.2 Create `src/environments/environment.ts` and `src/environments/environment.prod.ts` with `apiBaseUrl` constant
- [x] 1.3 Configure `HttpClient` with `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))` in `app.config.ts`
- [x] 1.4 Configure `provideRouter` with lazy routes and `withComponentInputBinding()` in `app.config.ts`
- [x] 1.5 Strip the default Angular placeholder from `app.html` and `app.css`; replace with bare `<router-outlet>`
- [x] 1.6 Add global base styles (box-sizing, body margin reset, full-height layout) to `styles.css`

## 2. Auth — `AuthService` and Guard

- [x] 2.1 Generate `src/app/core/services/auth.service.ts` — signals for `currentUser` and `isAuthenticated`; methods `login()`, `logout()`, `getToken()`; JWT stored in `localStorage`
- [x] 2.2 Create `src/app/core/interceptors/auth.interceptor.ts` — functional HTTP interceptor that attaches `Authorization: Bearer <token>` to outgoing requests
- [x] 2.3 Create `src/app/core/guards/auth.guard.ts` — `CanActivateFn` that redirects unauthenticated users to `/login`
- [x] 2.4 Create `src/app/core/guards/login-redirect.guard.ts` — `CanActivateFn` that redirects already-authenticated users from `/login` to `/patterns`

## 3. Auth — `LoginComponent`

- [x] 3.1 Generate `src/app/features/auth/login/login.component.ts` — standalone, `OnPush`, reactive form with `email` and `password` controls
- [x] 3.2 Implement form validation: both fields required; email uses `Validators.email`
- [x] 3.3 Implement `onSubmit()` — calls `AuthService.login()`, navigates to `/patterns` on success, shows inline error message on failure
- [x] 3.4 Display field-level validation errors (required, invalid email) on submit attempt
- [x] 3.5 Style login form with Tailwind: centered card layout, accessible labels, visible focus rings
- [x] 3.6 Add `login-redirect.guard` to the `/login` route in `app.routes.ts`

## 4. Routing

- [x] 4.1 Add `/login` route (eager `LoginComponent`) with `login-redirect.guard`
- [x] 4.2 Add `/patterns` route (lazy `PatternListComponent`) with `auth.guard`
- [x] 4.3 Add `/patterns/new` route (lazy `PatternCreateComponent`) with `auth.guard`
- [x] 4.4 Add `/patterns/:id` route (lazy `GridEditorComponent`) with `auth.guard`
- [x] 4.5 Add catch-all redirect to `/patterns`

## 5. Pattern API Service

- [x] 5.1 Generate `src/app/core/services/pattern-api.service.ts` — `providedIn: 'root'`; methods: `getPatterns()`, `getPattern(id)`, `createPattern(dto)`, `updatePattern(id, dto)`, `deletePattern(id)`
- [x] 5.2 Define TypeScript interfaces: `Pattern`, `CreatePatternDto`, `UpdatePatternDto`, `FilledCell` (`[row, col]`) in `src/app/core/models/pattern.model.ts`
- [x] 5.3 Implement serialization helper: `filledSetToArray(cells: Set<string>): [number, number][]` and `arrayToFilledSet(cells: [number, number][]): Set<string>`

## 6. Pattern List — `PatternListComponent` and `PatternCardComponent`

- [x] 6.1 Generate `src/app/features/patterns/pattern-list/pattern-list.component.ts` — standalone, `OnPush`; fetches patterns via `PatternApiService` on init using `toSignal`
- [x] 6.2 Render pattern cards using `@for` with `track pattern.id`; show empty-state when list is empty
- [x] 6.3 Generate `src/app/features/patterns/pattern-card/pattern-card.component.ts` — standalone, `OnPush`; `input()` for `pattern: Pattern`; `output()` for `delete`
- [x] 6.4 Render card with pattern name, dimensions ("R × C"), and human-readable last-edited date
- [x] 6.5 Implement Edit button → `router.navigate(['/patterns', pattern.id], { queryParams: { mode: 'edit' } })`
- [x] 6.6 Implement View button → `router.navigate(['/patterns', pattern.id], { queryParams: { mode: 'view' } })`
- [x] 6.7 Implement Delete button → open confirmation dialog; on confirm call `PatternApiService.deletePattern(id)`; on API error show error toast
- [x] 6.8 Build confirmation dialog as a standalone inline component or Angular CDK Dialog; dialog copy: "Delete '<name>'? This cannot be undone." with [Cancel] and [Delete] actions
- [x] 6.9 Add "New Pattern" button in list header → navigates to `/patterns/new`
- [x] 6.10 Style list and cards with Tailwind; ensure keyboard-accessible focus management on dialog open/close

## 7. Pattern Create — `PatternCreateComponent`

- [x] 7.1 Generate `src/app/features/patterns/pattern-create/pattern-create.component.ts` — standalone, `OnPush`, reactive form
- [x] 7.2 Add `name` control: required
- [x] 7.3 Add `rows` control: required, `min(1)`, integer validator
- [x] 7.4 Add `cols` control: required, `min(1)`, integer validator
- [x] 7.5 Implement `onSubmit()` — calls `PatternApiService.createPattern()`, navigates to `/patterns/:id?mode=edit` on success, shows form-level error on API failure
- [x] 7.6 Implement Cancel button → navigates to `/patterns` without calling the API
- [x] 7.7 Display field-level validation errors for all three fields on submit attempt
- [x] 7.8 Style form with Tailwind; match login card layout conventions

## 8. Grid State Model

- [x] 8.1 Create `src/app/features/editor/models/grid-state.model.ts` — export `GridState` interface: `{ patternId: string; name: string; rows: number; cols: number; filledCells: Set<string> }`
- [x] 8.2 Create `src/app/features/editor/utils/grid.utils.ts` — implement `cellKey(row, col)`, `toggleCell()`, `fillRow()`, `clearRow()`, `fillCol()`, `clearCol()`, `isRowFull()`, `isColFull()` pure functions operating on `Set<string>`
- [x] 8.3 Write unit tests for all grid util functions, especially Camp A partial-fill logic

## 9. Pattern Save Service

- [x] 9.1 Generate `src/app/features/editor/services/pattern-save.service.ts` — `providedIn: 'root'`
- [x] 9.2 Expose `isDirty` signal (boolean) and `saveStatus` signal (`'idle' | 'saving' | 'saved' | 'error'`)
- [x] 9.3 Implement `scheduleAutoSave(state: GridState)` — pushes to internal `Subject`, pipes through `debounceTime(2000)` and `switchMap` to `PatternApiService.updatePattern()`
- [x] 9.4 Implement `saveNow(state: GridState)` — immediately calls `PatternApiService.updatePattern()` bypassing debounce
- [x] 9.5 Set `isDirty = true` on `scheduleAutoSave()`; set `isDirty = false` on successful save response
- [x] 9.6 Create `src/app/features/editor/guards/unsaved-changes.guard.ts` — `CanDeactivateFn` that checks `isDirty`; returns `window.confirm('You have unsaved changes. Leave without saving?')` when dirty

## 10. Grid Canvas — `GridCanvasComponent`

- [x] 10.1 Generate `src/app/features/editor/components/grid-canvas/grid-canvas.component.ts` — standalone, `OnPush`; `input()` for `rows`, `cols`, `filledCells: Set<string>`, `cellSize: number`, `zoomLevel: number`, `readonly: boolean`; `output()` for `cellToggled` (emits `{ row, col }`)
- [x] 10.2 Obtain `ElementRef<HTMLCanvasElement>` via `viewChild`; set canvas `width` and `height` based on `cols * cellSize` and `rows * cellSize`
- [x] 10.3 Implement `drawGrid()` — draw cell borders and filled cells using `CanvasRenderingContext2D`; filled cells use `fillStyle = '#000000'`; iterate only filled cells from the sparse set for fill operations
- [x] 10.4 Call `drawGrid()` inside an `effect()` that reacts to `filledCells`, `cellSize`, and `zoomLevel` signal changes
- [x] 10.5 Implement click hit-testing: `(click)` handler divides `offsetX / cellSize` and `offsetY / cellSize` to derive `row` and `col`; emit `cellToggled` only when `!readonly`
- [x] 10.6 Add `role="img"` and `[attr.aria-label]` describing the grid dimensions on the canvas element
- [x] 10.7 Apply CSS `transform: scale(zoomLevel)` on the canvas wrapper element via `[style.transform]` binding; set `transform-origin: top left`

## 11. Grid Row Headers — `GridRowHeadersComponent`

- [x] 11.1 Generate `src/app/features/editor/components/grid-row-headers/grid-row-headers.component.ts` — standalone, `OnPush`; `input()` for `rows`, `cellSize`, `readonly`; `output()` for `rowClicked` (emits row index)
- [x] 11.2 Render row numbers 1–N as `<button>` elements using `@for`; each button height matches `cellSize`
- [x] 11.3 Emit `rowClicked` on button click when `!readonly`; disable buttons and add `aria-disabled` in view mode
- [x] 11.4 Sync vertical scroll position with canvas container via scroll event binding — **implemented via CSS `position: sticky` inside shared `overflow-auto` scroll container; JS scroll-event wiring is not required (see design.md Decision #1)**

## 12. Grid Col Headers — `GridColHeadersComponent`

- [x] 12.1 Generate `src/app/features/editor/components/grid-col-headers/grid-col-headers.component.ts` — standalone, `OnPush`; `input()` for `cols`, `cellSize`, `readonly`; `output()` for `colClicked` (emits col index)
- [x] 12.2 Render column numbers 1–N as `<button>` elements using `@for`; each button width matches `cellSize`
- [x] 12.3 Emit `colClicked` on button click when `!readonly`; disable buttons and add `aria-disabled` in view mode
- [x] 12.4 Sync horizontal scroll position with canvas container via scroll event binding — **implemented via CSS `position: sticky` inside shared `overflow-auto` scroll container; JS scroll-event wiring is not required (see design.md Decision #1)**

## 13. Grid Editor — `GridEditorComponent`

- [x] 13.1 Generate `src/app/features/editor/grid-editor/grid-editor.component.ts` — standalone, `OnPush`; reads `:id` route param and `mode` query param via `input()` with `withComponentInputBinding()`
- [x] 13.2 Fetch pattern on load via `PatternApiService.getPattern(id)`; deserialize `filledCells` using `arrayToFilledSet()`; store in a `signal<GridState>`
- [x] 13.3 Compose `GridColHeadersComponent`, `GridRowHeadersComponent`, and `GridCanvasComponent` in the editor template; wire scroll-sync between all three
- [x] 13.4 Implement `onCellToggled({ row, col })` — calls `toggleCell()` util, updates `filledCells` signal, calls `PatternSaveService.scheduleAutoSave()`
- [x] 13.5 Implement `onRowClicked(row)` — applies Camp A logic using `isRowFull()`, `fillRow()` or `clearRow()` utils; updates signal; calls `scheduleAutoSave()`
- [x] 13.6 Implement `onColClicked(col)` — applies Camp A logic using `isColFull()`, `fillCol()` or `clearCol()` utils; updates signal; calls `scheduleAutoSave()`
- [x] 13.7 Implement inline editable pattern name in toolbar: `contenteditable` span or text input bound to `gridState().name`; changes trigger `scheduleAutoSave()`
- [x] 13.8 Implement Save button — calls `PatternSaveService.saveNow()`; hidden when `mode === 'view'`
- [x] 13.9 Bind `PatternSaveService.isDirty` and `saveStatus` signals to toolbar indicator and "Saved ✓" / "Save failed ⚠" feedback
- [x] 13.10 Implement Back button — navigates to `/patterns`; `unsaved-changes.guard` handles dirty prompt
- [x] 13.11 Attach `unsaved-changes.guard` to the `/patterns/:id` route
- [x] 13.12 Pass `readonly = mode === 'view'` to all three child components; hide Save button and show "Viewing — Read Only" badge in view mode

## 14. Mobile Gestures

- [x] 14.1 Add `touch-action: none` via Tailwind or inline style to the canvas wrapper to prevent browser scroll interference during gesture handling
- [x] 14.2 Implement `touchstart` / `touchmove` / `touchend` host listeners on `GridCanvasComponent` to detect 1-finger tap vs. 2-finger pinch/pan
- [x] 14.3 Implement pinch-to-zoom: track initial distance between two touch points on `touchstart`; compute scale ratio on `touchmove`; update `zoomLevel` signal (clamp between 0.5× and 4×)
- [x] 14.4 Implement 2-finger pan: on `touchmove` with 2 touches after zoom, scroll the grid container by the delta of the midpoint
- [x] 14.5 Implement 1-finger tap guard: only emit `cellToggled` if `touchend` occurs within 8 px of `touchstart` position (not a drag)

## 15. Accessibility and Polish

- [x] 15.1 Verify all interactive elements (buttons, inputs, dialogs) have visible focus rings meeting WCAG AA 3:1 contrast ratio
- [x] 15.2 Verify color contrast of filled cell black (`#000000`) against canvas background meets WCAG AA
- [x] 15.3 Ensure the delete confirmation dialog traps focus and returns focus to the Delete button on close
- [x] 15.4 Add `aria-live="polite"` region for save status feedback ("Saved ✓", "Save failed ⚠")
- [x] 15.5 Add `<title>` updates per route (login, pattern list, editor) using Angular `Title` service
- [x] 15.6 Run axe-core audit against all three main views and fix any reported violations

## 16. Integration and Final Wiring

- [ ] 16.1 Verify full happy-path end-to-end flow: login → pattern list → create pattern → editor → save → back → pattern list
- [ ] 16.2 Verify delete flow: pattern list → confirm dialog → delete → card removed
- [ ] 16.3 Verify view mode: pattern card → View → editor in read-only → no interactions fire → Back returns to list
- [ ] 16.4 Verify auto-save: toggle cell → wait 2 s → PATCH called; toggle rapidly → only one PATCH after final change
- [ ] 16.5 Verify unsaved-changes guard: make change → tap Back → prompt appears → cancel stays on editor; confirm leaves
- [ ] 16.6 Verify mobile gestures: pinch zooms canvas; 2-finger drag pans; single tap toggles cell
- [x] 16.7 Run `ng build` and fix any TypeScript or template compilation errors

