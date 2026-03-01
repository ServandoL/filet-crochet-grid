import {inject, Injectable, signal} from '@angular/core';
import {catchError, delay, EMPTY, first, Observable, Subject} from 'rxjs';
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
        }),
        delay(2000),
        tap(() => this.saveStatus.set('idle')),
        catchError(() => {
          this.saveStatus.set('error');
          return EMPTY
        })
      );
  }
}
