import {inject, Injectable, signal} from '@angular/core';
import {catchError, EMPTY, first, Observable, Subject} from 'rxjs';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {GridState} from '../models/grid-state.model';
import {filledSetToArray, Pattern} from '../../../core/models/pattern.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Injectable({providedIn: 'root'})
export class PatternSaveService {
  private readonly api = inject(PatternApiService);

  readonly isDirty = signal(false);
  readonly saveStatus = signal<SaveStatus>('idle');

  private readonly saveSubject = new Subject<GridState>();
  // Tracks the pending "reset to idle" timer so it can be cancelled on the next save.
  private idleTimerSub: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.saveSubject
      .pipe(
        takeUntilDestroyed(),
        debounceTime(2000),
        switchMap((state) => this.doSave(state)),
      )
      .subscribe();
  }

  scheduleAutoSave(state: GridState): void {
    this.isDirty.set(true);
    this.saveSubject.next(state);
  }

  saveNow(state: GridState): void {
    this.isDirty.set(true);
    this.doSave(state).pipe(first()).subscribe();
  }

  private doSave(state: GridState): Observable<Pattern> {
    // Cancel any pending "reset to idle" from a previous successful save so the
    // new save cycle starts cleanly.
    if (this.idleTimerSub !== null) {
      clearTimeout(this.idleTimerSub);
      this.idleTimerSub = null;
    }
    this.saveStatus.set('saving');
    return this.api
      .updatePattern(state._id, {
        name: state.name,
        cells: filledSetToArray(state.filledCells),
      })
      .pipe(
        tap(() => {
          this.isDirty.set(false);
          this.saveStatus.set('saved');
          // Use a plain setTimeout (outside the switchMap chain) so a subsequent
          // rapid save cannot cancel the 2-second "Saved ✓" display window.
          this.idleTimerSub = setTimeout(() => {
            this.saveStatus.set('idle');
            this.idleTimerSub = null;
          }, 2000);
        }),
        catchError(() => {
          this.saveStatus.set('error');
          return EMPTY;
        }),
      );
  }
}


