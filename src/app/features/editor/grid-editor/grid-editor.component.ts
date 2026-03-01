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
import {CellPosition, GridCanvasComponent} from '../components/grid-canvas/grid-canvas.component';
import {GridRowHeadersComponent} from '../components/grid-row-headers/grid-row-headers.component';
import {GridColHeadersComponent} from '../components/grid-col-headers/grid-col-headers.component';
import {GridState} from '../models/grid-state.model';
import {arrayToFilledSet} from '../../../core/models/pattern.model';
import {fillCol, fillRow, toggleCell} from '../utils/grid.utils';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, of} from 'rxjs';

const DEFAULT_CELL_SIZE = 24;

@Component({
  selector: 'app-grid-editor',
  imports: [GridCanvasComponent, GridRowHeadersComponent, GridColHeadersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid-editor.component.html',
})
export class GridEditorComponent implements OnInit {
  // Route inputs (via withComponentInputBinding)
  readonly id = input.required<string>();
  readonly mode = input<string>('edit');

  private readonly api = inject(PatternApiService);
  protected readonly saveService = inject(PatternSaveService);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly destroy = inject(DestroyRef);


  readonly gridState = signal<GridState | null>(null);
  readonly loading = signal(true);
  readonly zoomLevel = signal(1);
  readonly cellSize = signal(DEFAULT_CELL_SIZE);

  readonly isEditMode = computed(() => this.mode() !== 'view');

  ngOnInit(): void {
    // Reset save service state for this session
    this.saveService.isDirty.set(false);
    this.saveService.saveStatus.set('idle');

    this.api.getPattern(this.id()).pipe(takeUntilDestroyed(this.destroy), catchError(() => {
      this.loading.set(false);
      return of(undefined);
    })).subscribe((pattern) => {
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
          void this.router.navigate(['/patterns'])
        }
      }
    );
  }

  onCellToggled(pos: CellPosition): void {
    const state = this.gridState();
    if (!state) return;
    const newCells = toggleCell(state.filledCells, pos.row, pos.col);
    this.gridState.set({...state, filledCells: newCells});
    this.saveService.scheduleAutoSave({...state, filledCells: newCells});
  }

  onRowClicked(row: number): void {
    const state = this.gridState();
    if (!state) return;
    const newCells = fillRow(state.filledCells, row, state.cols);
    this.gridState.set({...state, filledCells: newCells});
    this.saveService.scheduleAutoSave({...state, filledCells: newCells});
  }

  onColClicked(col: number): void {
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
}

