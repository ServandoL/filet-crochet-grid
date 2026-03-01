## 1. Backend — Types, Schemas, and Models

- [x] 1.1 Add `DbProgress` interface to `backend/src/types.ts`: `{ highlightedCells: FilledCell[]; updatedAt: Date }` — note: no `patternId` field; `_id` is the pattern's `ObjectId` (satellite document pattern)
- [x] 1.2 Add `ProgressDto` interface to `backend/src/types.ts`: `{ _id: string; highlightedCells: FilledCell[]; updatedAt: string }` — `_id` equals the pattern's `_id`
- [x] 1.3 Add `UpsertProgressDto` interface to `backend/src/types.ts`: `{ highlightedCells: FilledCell[] }`
- [x] 1.4 Add `UpsertProgressSchema` to `backend/src/zod.schemas.ts`: `{ highlightedCells: z.array(FilledCellSchema) }`

## 2. Backend — MongoDB Collection and Service

- [x] 2.1 Add `progress` getter to `MongoDatabase` in `backend/src/mongo.ts` returning `Collection<DbProgress>` using collection name `PROGRESS` — no index creation needed; `_id` uniqueness is implicit
- [x] 2.2 Create `backend/src/services/progress.service.ts` — `ProgressService` class with three static methods:
  - `getByPatternId(patternId: string): Promise<WithId<DbProgress> | null>` — `findOne({ _id: new ObjectId(patternId) })`
  - `upsertByPatternId(patternId: string, dto: UpsertProgressDto): Promise<WithId<DbProgress> | undefined>` — uses `replaceOne({ _id: new ObjectId(patternId) }, { highlightedCells, updatedAt: new Date() }, { upsert: true })`; replacement body must NOT include `_id`; fetch and return the document after upsert
  - `deleteByPatternId(patternId: string): Promise<DeleteResult | undefined>`

## 3. Backend — Progress API Endpoints

- [x] 3.1 Create `backend/src/controllers/progress.controller.ts` with `progressRouter` (Koa Router)
- [x] 3.2 Implement `GET /api/patterns/:id/progress` — validate `id`, call `ProgressService.getByPatternId(id)`, return `200` with `ProgressDto` or `404` if no progress document exists
- [x] 3.3 Implement `PUT /api/patterns/:id/progress` — validate `id`, parse body with `UpsertProgressSchema`, call `ProgressService.upsertByPatternId(id, body)`, return `200` with `ProgressDto`
- [x] 3.4 Implement `DELETE /api/patterns/:id/progress` — validate `id`, call `ProgressService.deleteByPatternId(id)`, return `204`
- [x] 3.5 Register `progressRouter` in `backend/src/server.ts`

## 4. Backend — Cascade Delete Progress on Pattern Delete

- [x] 4.1 Update `PatternsService.deletePattern()` in `backend/src/services/patterns.service.ts` to call `ProgressService.deleteByPatternId(id)` after a successful pattern deletion

## 5. Frontend — Models and API Service

- [x] 5.1 Add `Progress` interface to `src/app/core/models/pattern.model.ts`: `{ _id: string; highlightedCells: FilledCell[]; updatedAt: string }` — `_id` equals the pattern's `_id` (satellite document pattern)
- [x] 5.2 Add `UpsertProgressDto` interface to `src/app/core/models/pattern.model.ts`: `{ highlightedCells: FilledCell[] }`
- [x] 5.3 Add `getProgress(patternId: string): Observable<Progress>` to `PatternApiService` — `GET /api/patterns/:id/progress`
- [x] 5.4 Add `upsertProgress(patternId: string, dto: UpsertProgressDto): Observable<Progress>` to `PatternApiService` — `PUT /api/patterns/:id/progress`
- [x] 5.5 Add `deleteProgress(patternId: string): Observable<void>` to `PatternApiService` — `DELETE /api/patterns/:id/progress`

## 6. Frontend — Progress State Model and Save Service

- [x] 6.1 Create `src/app/features/editor/models/progress-state.model.ts` — export `ProgressState` interface: `{ patternId: string; highlightedCells: Set<string>; patternUpdatedAt: string; progressUpdatedAt: string | null }` — `patternId` is the local name for the value sourced from the route `:id` param and from `Progress._id`
- [x] 6.2 Create `src/app/features/editor/services/create-save-pipeline.ts` — generic factory `createSavePipeline<TState>(persist, destroyRef, debounceMs?)` returning `SavePipeline<TState>` with `isDirty`, `saveStatus`, `scheduleAutoSave`, `saveNow`; export `SaveStatus` type from this module. Refactor `PatternSaveService` and `ProgressSaveService` to delegate to this factory — each service exposes the same public API surface, only the `persist` callback differs.

## 7. Frontend — GridCanvasComponent: Highlight Overlay

- [x] 7.1 Add optional `highlightedCells` input to `GridCanvasComponent`: `input<Set<string>>(new Set())` — defaults to empty Set
- [x] 7.2 Include `highlightedCells` in the `effect()` dependency list so the canvas redraws when it changes
- [x] 7.3 After drawing pattern cells and grid lines, add a highlight pass in `drawGrid()`: for each key in `highlightedCells()`, parse `row` and `col`, set `ctx.strokeStyle = '#0f766e'` (teal-700 — passes WCAG AA 3:1 on both white and black), `ctx.lineWidth = 2`, draw `ctx.strokeRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4)`

## 8. Frontend — Header Components: Progress Mode Touch Targets

- [x] 8.1 Add `progressMode` input to `GridRowHeadersComponent`: `input<boolean>(false)` — when `true`, each button height is `Math.max(cellSize(), 44)` instead of `cellSize()`
- [x] 8.2 Add `progressMode` input to `GridColHeadersComponent`: `input<boolean>(false)` — when `true`, each button width is `Math.max(cellSize(), 44)` instead of `cellSize()`
- [x] 8.3 Update `grid-row-headers.component.html` to bind button `[style.height.px]` to a `buttonSize` computed value
- [x] 8.4 Update `grid-col-headers.component.html` to bind button `[style.width.px]` to a `buttonSize` computed value

## 9. Frontend — GridEditorComponent: Progress Mode Wiring

- [x] 9.1 Add `isProgressMode = computed(() => this.mode() === 'progress')` to `GridEditorComponent`
- [x] 9.2 On `ngOnInit`, when in progress mode: fire `GET /api/patterns/:id/progress` in parallel with `GET /api/patterns/:id` using `forkJoin`; treat a `404` from the progress endpoint as an empty `ProgressState` (no prior progress)
- [x] 9.3 Add `progressState = signal<ProgressState | null>(null)` to `GridEditorComponent`
- [x] 9.4 Add `isProgressStale = computed(...)` — returns `true` when `progressState()` has a non-null `progressUpdatedAt` and `patternUpdatedAt > progressUpdatedAt`
- [x] 9.5 Add `staleBannerDismissed = signal(false)` — controls banner visibility
- [x] 9.6 Implement `onProgressCellToggled(pos: CellPosition)` — calls `toggleCell()` on `progressState().highlightedCells`; updates `progressState`; calls `progressSaveService.scheduleAutoSave()`
- [x] 9.7 Implement `onProgressRowClicked(row: number)` — applies Camp A fill-first logic (`fillRow` / `clearRow` from `grid.utils.ts`) on `progressState().highlightedCells`; updates `progressState`; calls `scheduleAutoSave()`
- [x] 9.8 Implement `onProgressColClicked(col: number)` — same Camp A logic using `fillCol` / `clearCol` on progress cells
- [x] 9.9 Implement `onProgressSave()` — calls `progressSaveService.saveNow(progressState()!)`
- [x] 9.10 Implement `onClearProgress()` — shows inline confirmation dialog; on confirm calls `PatternApiService.deleteProgress(id())`, resets `progressState.highlightedCells` to empty Set, resets `progressSaveService.isDirty` to `false`
- [x] 9.11 In the template, pass `[highlightedCells]="isProgressMode() ? (progressState()?.highlightedCells ?? emptySet) : emptySet"` to `GridCanvasComponent` — where `emptySet` is a class-level `readonly emptySet = new Set<string>()`
- [x] 9.12 In the template, pass `[readonly]="!isEditMode() && !isProgressMode()"` to canvas and headers
- [x] 9.13 Route canvas `(cellToggled)` to `onProgressCellToggled` when `isProgressMode()`, else `onCellToggled` — single handler branches on `isProgressMode()`
- [x] 9.14 Route row header `(rowClicked)` to `onProgressRowClicked` when `isProgressMode()`, else `onRowClicked`
- [x] 9.15 Route col header `(colClicked)` to `onProgressColClicked` when `isProgressMode()`, else `onColClicked`
- [x] 9.16 Pass `[progressMode]="isProgressMode()"` to `GridRowHeadersComponent` and `GridColHeadersComponent`
- [x] 9.17 Update `ngOnInit` to reset `progressSaveService.isDirty` and `progressSaveService.saveStatus` at the start of each session
- [x] 9.18 Wire `unsavedChangesGuard` to also check `progressSaveService.isDirty()` when in progress mode

## 10. Frontend — GridEditorComponent: Progress Toolbar Template

- [x] 10.1 Add progress mode toolbar branch in `grid-editor.component.html` — teal badge, stale banner, aria-live, dirty indicator, Save + Clear All buttons
- [x] 10.2 Add inline confirmation dialog for Clear All Progress — CDK focus-trap, Cancel (cdkFocusInitial) and Clear actions
- [x] 10.3 Update the `<h1 class="sr-only">` to read "… — Filet Crochet Grid (Progress)" when `isProgressMode()`
- [x] 10.4 Update `Title` service call to set `"${name} — Progress | Filet Crochet Grid"` when in progress mode

## 11. Frontend — Pattern Card: Progress Button

- [x] 11.1 Add `onProgress()` method to `PatternCardComponent` — navigates to `/patterns/:id?mode=progress`
- [x] 11.2 Add Progress button to `pattern-card.component.html` between View and Delete buttons — teal styling; `[attr.aria-label]="'Track progress for ' + pattern().name"`

## 12. Accessibility and Polish

- [x] 12.1 Stale-progress warning banner: `text-amber-800` on `bg-amber-50` = 7.5:1 contrast ✓ WCAG AA
- [x] 12.2 Clear All Progress dialog traps focus (`cdkTrapFocus`); Cancel has `cdkFocusInitial`; closing returns focus to Clear All button
- [x] 12.3 Highlight border is adaptive: `#ffffff` (white, 21:1) on filled (black) cells — WCAG AAA; `#0f766e` (teal-700, 5.07:1) on empty (white) cells — WCAG AA; `lineWidth = 3` for visibility at small zoom
- [x] 12.4 Row/col headers in progress mode: min 44px via `buttonSize` computed; aria-labels updated to "tap to mark complete"
- [x] 12.5 `aria-live="polite"` region added to progress toolbar for save status feedback

## 13. Integration Verification

- [ ] 13.1 Verify full progress happy path: pattern list → Progress → highlights load → tap row → tap cell → auto-save fires → Back → re-enter → highlights restored
- [ ] 13.2 Verify stale warning: edit a pattern in edit mode → enter progress mode → amber banner appears → dismiss → banner gone
- [ ] 13.3 Verify Clear All Progress: highlights present → tap Clear All → confirm → grid clears → `DELETE` called → re-enter → no highlights
- [ ] 13.4 Verify cascade delete: delete a pattern with saved progress → confirm `PROGRESS` document is also removed
- [ ] 13.5 Verify unsaved-changes guard in progress mode: tap row → tap Back → confirm prompt appears → cancel stays → confirm navigates
- [ ] 13.6 Verify view mode and edit mode are unaffected: no `highlightedCells` passed to canvas in those modes; no teal borders rendered
- [ ] 13.7 Run `ng build` and fix any TypeScript or template compilation errors

