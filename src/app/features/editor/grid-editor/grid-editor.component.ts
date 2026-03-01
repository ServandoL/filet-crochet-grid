import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {PatternSaveService} from '../services/pattern-save.service';
import {ProgressSaveService} from '../services/progress-save.service';
import {CellPosition, GridCanvasComponent} from '../components/grid-canvas/grid-canvas.component';
import {GridRowHeadersComponent} from '../components/grid-row-headers/grid-row-headers.component';
import {GridColHeadersComponent} from '../components/grid-col-headers/grid-col-headers.component';
import {GridState} from '../models/grid-state.model';
import {ProgressState} from '../models/progress-state.model';
import {arrayToFilledSet} from '../../../core/models/pattern.model';
import {fillCol, fillRow, toggleCell} from '../utils/grid.utils';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, forkJoin, of} from 'rxjs';
import {A11yModule} from '@angular/cdk/a11y';

const DEFAULT_CELL_SIZE = 24;

@Component({
  selector: 'app-grid-editor',
  imports: [GridCanvasComponent, GridRowHeadersComponent, GridColHeadersComponent, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid-editor.component.html',
})
export class GridEditorComponent implements OnInit {
  // Route inputs (via withComponentInputBinding)
  readonly id = input.required<string>();
  readonly mode = input<string>('edit');

  private readonly api = inject(PatternApiService);
  protected readonly saveService = inject(PatternSaveService);
  protected readonly progressSaveService = inject(ProgressSaveService);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly destroy = inject(DestroyRef);

  readonly gridState = signal<GridState | null>(null);
  readonly progressState = signal<ProgressState | null>(null);
  readonly loading = signal(true);
  readonly zoomLevel = signal(1);
  readonly cellSize = signal(DEFAULT_CELL_SIZE);
  readonly staleBannerDismissed = signal(false);
  readonly confirmingClearProgress = signal(false);

  /** Shared empty set — passed to canvas when not in progress mode to avoid new Set() on every render */
  readonly emptySet = new Set<string>();

  readonly isEditMode = computed(() => this.mode() === 'edit');
  readonly isProgressMode = computed(() => this.mode() === 'progress');

  readonly isProgressStale = computed(() => {
    const ps = this.progressState();
    if (!ps || !ps.progressUpdatedAt) return false;
    return ps.patternUpdatedAt > ps.progressUpdatedAt;
  });

  ngOnInit(): void {
    // Reset save service state for this session
    this.saveService.isDirty.set(false);
    this.saveService.saveStatus.set('idle');
    this.progressSaveService.isDirty.set(false);
    this.progressSaveService.saveStatus.set('idle');

    if (this.isProgressMode()) {
      // Parallel load: pattern + progress
      forkJoin({
        pattern: this.api.getPattern(this.id()),
        progress: this.api.getProgress(this.id()).pipe(catchError(() => of(null))),
      }).pipe(
        takeUntilDestroyed(this.destroy),
        catchError(() => {
          this.loading.set(false);
          return of(null);
        }),
      ).subscribe((result) => {
        if (!result) { void this.router.navigate(['/patterns']); return; }
        const {pattern, progress} = result;
        const state: GridState = {
          _id: pattern._id,
          name: pattern.name,
          rows: pattern.rows,
          cols: pattern.cols,
          filledCells: arrayToFilledSet(pattern.cells),
        };
        this.gridState.set(state);
        this.progressState.set({
          patternId: pattern._id,
          highlightedCells: progress ? arrayToFilledSet(progress.highlightedCells) : new Set<string>(),
          patternUpdatedAt: pattern.updatedAt,
          progressUpdatedAt: progress?.updatedAt ?? null,
        });
        this.loading.set(false);
        this.titleService.setTitle(`${pattern.name} — Progress | Filet Crochet Grid`);
      });
    } else {
      this.api.getPattern(this.id()).pipe(
        takeUntilDestroyed(this.destroy),
        catchError(() => { this.loading.set(false); return of(undefined); }),
      ).subscribe((pattern) => {
        if (pattern) {
          const state: GridState = {
            _id: pattern._id,
            name: pattern.name,
            rows: pattern.rows,
            cols: pattern.cols,
            filledCells: arrayToFilledSet(pattern.cells),
          };
          this.gridState.set(state);
          this.loading.set(false);
          this.titleService.setTitle(`${pattern.name} — Filet Crochet Grid`);
        } else {
          void this.router.navigate(['/patterns']);
        }
      });
    }
  }

  // ── Edit mode handlers ──────────────────────────────────────────────────

  onCellToggled(pos: CellPosition): void {
    if (this.isProgressMode()) {
      this.onProgressCellToggled(pos);
      return;
    }
    const state = this.gridState();
    if (!state) return;
    const newCells = toggleCell(state.filledCells, pos.row, pos.col);
    this.gridState.set({...state, filledCells: newCells});
    this.saveService.scheduleAutoSave({...state, filledCells: newCells});
  }

  onRowClicked(row: number): void {
    if (this.isProgressMode()) {
      this.onProgressRowClicked(row);
      return;
    }
    const state = this.gridState();
    if (!state) return;
    const newCells = fillRow(state.filledCells, row, state.cols);
    this.gridState.set({...state, filledCells: newCells});
    this.saveService.scheduleAutoSave({...state, filledCells: newCells});
  }

  onColClicked(col: number): void {
    if (this.isProgressMode()) {
      this.onProgressColClicked(col);
      return;
    }
    const state = this.gridState();
    if (!state) return;
    const newCells = fillCol(state.filledCells, col, state.rows);
    this.gridState.set({...state, filledCells: newCells});
    this.saveService.scheduleAutoSave({...state, filledCells: newCells});
  }

  onNameChange(event: Event): void {
    const state = this.gridState();
    if (!state) return;
    const name = (event.target as HTMLInputElement).value;
    const newState = {...state, name};
    this.gridState.set(newState);
    this.saveService.scheduleAutoSave(newState);
  }

  onSave(): void {
    const state = this.gridState();
    if (state) this.saveService.saveNow(state);
  }

  onBack(): void {
    void this.router.navigate(['/patterns']);
  }

  onZoomChange(event: Event): void {
    const zoom = (event as CustomEvent<number>).detail;
    this.zoomLevel.set(zoom);
  }

  // ── Progress mode handlers ──────────────────────────────────────────────

  onProgressCellToggled(pos: CellPosition): void {
    const ps = this.progressState();
    if (!ps) return;
    const newCells = toggleCell(ps.highlightedCells, pos.row, pos.col);
    const newState: ProgressState = {...ps, highlightedCells: newCells};
    this.progressState.set(newState);
    this.progressSaveService.scheduleAutoSave(newState);
  }

  onProgressRowClicked(row: number): void {
    const ps = this.progressState();
    const gs = this.gridState();
    if (!ps || !gs) return;
    const newCells = fillRow(ps.highlightedCells, row, gs.cols);
    const newState: ProgressState = {...ps, highlightedCells: newCells};
    this.progressState.set(newState);
    this.progressSaveService.scheduleAutoSave(newState);
  }

  onProgressColClicked(col: number): void {
    const ps = this.progressState();
    const gs = this.gridState();
    if (!ps || !gs) return;
    const newCells = fillCol(ps.highlightedCells, col, gs.rows);
    const newState: ProgressState = {...ps, highlightedCells: newCells};
    this.progressState.set(newState);
    this.progressSaveService.scheduleAutoSave(newState);
  }

  onProgressSave(): void {
    const ps = this.progressState();
    if (ps) this.progressSaveService.saveNow(ps);
  }

  onClearProgressConfirm(): void {
    const ps = this.progressState();
    if (!ps) return;
    this.api.deleteProgress(ps.patternId).pipe(
      takeUntilDestroyed(this.destroy),
      catchError(() => of(undefined)),
    ).subscribe(() => {
      const newState: ProgressState = {...ps, highlightedCells: new Set<string>(), progressUpdatedAt: null};
      this.progressState.set(newState);
      this.progressSaveService.isDirty.set(false);
      this.progressSaveService.saveStatus.set('idle');
      this.confirmingClearProgress.set(false);
    });
  }

  onClearProgressCancel(): void {
    this.confirmingClearProgress.set(false);
  }
}
