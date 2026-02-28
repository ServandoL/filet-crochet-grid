import { Injectable, inject, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { PatternApiService } from '../../../core/services/pattern-api.service';
import { GridState } from '../models/grid-state.model';
import { filledSetToArray } from '../../../core/models/pattern.model';
import { Pattern } from '../../../core/models/pattern.model';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Injectable({ providedIn: 'root' })
export class PatternSaveService {
  private readonly api = inject(PatternApiService);

  readonly isDirty = signal(false);
  readonly saveStatus = signal<SaveStatus>('idle');

  private readonly saveSubject = new Subject<GridState>();

  constructor() {
    this.saveSubject
      .pipe(
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
    this.doSave(state).subscribe();
  }

  private doSave(state: GridState): Observable<Pattern> {
    this.saveStatus.set('saving');
    return this.api
      .updatePattern(state.patternId, {
        name: state.name,
        cells: filledSetToArray(state.filledCells),
      })
      .pipe(
        tap({
          next: () => {
            this.isDirty.set(false);
            this.saveStatus.set('saved');
            setTimeout(() => this.saveStatus.set('idle'), 2000);
          },
          error: () => {
            this.saveStatus.set('error');
          },
        }),
      );
  }
}
