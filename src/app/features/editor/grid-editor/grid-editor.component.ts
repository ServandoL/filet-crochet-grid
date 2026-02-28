import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PatternApiService } from '../../../core/services/pattern-api.service';
import { PatternSaveService } from '../services/pattern-save.service';
import { GridCanvasComponent, CellPosition } from '../components/grid-canvas/grid-canvas.component';
import { GridRowHeadersComponent } from '../components/grid-row-headers/grid-row-headers.component';
import { GridColHeadersComponent } from '../components/grid-col-headers/grid-col-headers.component';
import { GridState } from '../models/grid-state.model';
import { arrayToFilledSet } from '../../../core/models/pattern.model';
import { toggleCell, fillRow, fillCol } from '../utils/grid.utils';

const DEFAULT_CELL_SIZE = 24;

@Component({
  selector: 'app-grid-editor',
  imports: [GridCanvasComponent, GridRowHeadersComponent, GridColHeadersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-screen bg-white">

      <!-- Toolbar -->
      <header class="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white shrink-0 z-10">
        <button
          type="button"
          (click)="onBack()"
          class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 transition"
          aria-label="Back to pattern list"
        >
          ← Back
        </button>

        <div class="h-5 w-px bg-gray-200"></div>

        <!-- Inline pattern name -->
        @if (isEditMode()) {
          <input
            type="text"
            class="flex-1 text-sm font-semibold text-gray-900 bg-transparent border-0
                   border-b border-transparent focus:border-indigo-400 focus:outline-none
                   px-1 py-0.5 min-w-0"
            [value]="gridState()?.name ?? ''"
            (input)="onNameChange($event)"
            aria-label="Pattern name"
          />
        } @else {
          <span class="flex-1 text-sm font-semibold text-gray-900 truncate px-1">
            {{ gridState()?.name }}
          </span>
          <span class="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">
            Viewing — Read Only
          </span>
        }

        <!-- Save status aria-live region -->
        <div aria-live="polite" aria-atomic="true" class="sr-only">
          @if (saveService.saveStatus() === 'saved') { Saved. }
          @if (saveService.saveStatus() === 'error') { Save failed. }
        </div>

        <!-- Save status visual indicator -->
        @if (isEditMode()) {
          <div class="flex items-center gap-2 shrink-0">
            @if (saveService.saveStatus() === 'saving') {
              <span class="text-xs text-gray-400">Saving…</span>
            } @else if (saveService.saveStatus() === 'saved') {
              <span class="text-xs text-green-600">Saved ✓</span>
            } @else if (saveService.saveStatus() === 'error') {
              <span class="text-xs text-red-600">Save failed ⚠</span>
            } @else if (saveService.isDirty()) {
              <span class="inline-block w-2 h-2 rounded-full bg-amber-400"
                    title="Unsaved changes" aria-label="Unsaved changes"></span>
            }

            <button
              type="button"
              (click)="onSave()"
              class="rounded-lg bg-indigo-600 text-white text-xs font-medium px-3 py-1.5
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
                     focus:ring-offset-1 transition"
            >
              Save
            </button>
          </div>
        }
      </header>

      @if (loading()) {
        <div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Loading pattern…
        </div>
      } @else if (gridState(); as state) {
        <!-- Scrollable grid area -->
        <div
          #scrollContainer
          class="flex-1 overflow-auto"
          (zoomchange)="onZoomChange($event)"
        >
          <!-- Col headers (sticky top) -->
          <div class="sticky top-0 z-10 bg-white">
            <app-grid-col-headers
              [cols]="state.cols"
              [cellSize]="cellSize()"
              [readonly]="!isEditMode()"
              (colClicked)="onColClicked($event)"
            />
          </div>

          <!-- Row headers + canvas side-by-side -->
          <div class="flex">
            <!-- Row headers (sticky left) -->
            <div class="sticky left-0 z-10 bg-white">
              <app-grid-row-headers
                [rows]="state.rows"
                [cellSize]="cellSize()"
                [readonly]="!isEditMode()"
                (rowClicked)="onRowClicked($event)"
              />
            </div>

            <!-- Canvas -->
            <app-grid-canvas
              [rows]="state.rows"
              [cols]="state.cols"
              [filledCells]="state.filledCells"
              [cellSize]="cellSize()"
              [zoomLevel]="zoomLevel()"
              [readonly]="!isEditMode()"
              (cellToggled)="onCellToggled($event)"
            />
          </div>
        </div>
      }

    </div>
  `,
})
export class GridEditorComponent implements OnInit {
  // Route inputs (via withComponentInputBinding)
  readonly id = input.required<string>();
  readonly mode = input<string>('edit');

  private readonly api = inject(PatternApiService);
  protected readonly saveService = inject(PatternSaveService);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);

  readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly gridState = signal<GridState | null>(null);
  readonly loading = signal(true);
  readonly zoomLevel = signal(1);
  readonly cellSize = signal(DEFAULT_CELL_SIZE);

  readonly isEditMode = computed(() => this.mode() !== 'view');

  ngOnInit(): void {
    // Reset save service state for this session
    this.saveService.isDirty.set(false);
    this.saveService.saveStatus.set('idle');

    this.api.getPattern(this.id()).subscribe({
      next: (pattern) => {
        const state: GridState = {
          patternId: pattern.id,
          name: pattern.name,
          rows: pattern.rows,
          cols: pattern.cols,
          filledCells: arrayToFilledSet(pattern.cells),
        };
        this.gridState.set(state);
        this.loading.set(false);
        this.titleService.setTitle(`${pattern.name} — Filet Crochet Grid`);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/patterns']);
      },
    });
  }

  onCellToggled(pos: CellPosition): void {
    const state = this.gridState();
    if (!state) return;
    const newCells = toggleCell(state.filledCells, pos.row, pos.col);
    this.gridState.set({ ...state, filledCells: newCells });
    this.saveService.scheduleAutoSave({ ...state, filledCells: newCells });
  }

  onRowClicked(row: number): void {
    const state = this.gridState();
    if (!state) return;
    const newCells = fillRow(state.filledCells, row, state.cols);
    this.gridState.set({ ...state, filledCells: newCells });
    this.saveService.scheduleAutoSave({ ...state, filledCells: newCells });
  }

  onColClicked(col: number): void {
    const state = this.gridState();
    if (!state) return;
    const newCells = fillCol(state.filledCells, col, state.rows);
    this.gridState.set({ ...state, filledCells: newCells });
    this.saveService.scheduleAutoSave({ ...state, filledCells: newCells });
  }

  onNameChange(event: Event): void {
    const state = this.gridState();
    if (!state) return;
    const name = (event.target as HTMLInputElement).value;
    const newState = { ...state, name };
    this.gridState.set(newState);
    this.saveService.scheduleAutoSave(newState);
  }

  onSave(): void {
    const state = this.gridState();
    if (state) this.saveService.saveNow(state);
  }

  onBack(): void {
    this.router.navigate(['/patterns']);
  }

  onZoomChange(event: Event): void {
    const zoom = (event as CustomEvent<number>).detail;
    this.zoomLevel.set(zoom);
  }
}

