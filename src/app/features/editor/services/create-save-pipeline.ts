import {DestroyRef, signal} from '@angular/core';
import {catchError, EMPTY, first, Observable, Subject} from 'rxjs';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SavePipeline<TState> {
  readonly isDirty: ReturnType<typeof signal<boolean>>;
  readonly saveStatus: ReturnType<typeof signal<SaveStatus>>;
  scheduleAutoSave(state: TState): void;
  saveNow(state: TState): void;
}

/**
 * Factory that wires up the debounced auto-save pipeline shared by
 * PatternSaveService and ProgressSaveService.
 *
 * `inject()` must NOT be called inside this function — it is a plain
 * factory, not an Angular injectable. The caller passes `destroyRef`
 * (obtained via `inject(DestroyRef)` in the service constructor) so
 * that `takeUntilDestroyed` binds to the correct lifetime.
 *
 * @param persist  API call that performs the actual save; returns an Observable.
 * @param destroyRef  The service's DestroyRef, used to complete the pipeline on destroy.
 * @param debounceMs  Debounce window in milliseconds (default 2000).
 */
export function createSavePipeline<TState>(
  persist: (state: TState) => Observable<unknown>,
  destroyRef: DestroyRef,
  debounceMs = 2000,
): SavePipeline<TState> {
  const isDirty = signal(false);
  const saveStatus = signal<SaveStatus>('idle');
  const saveSubject = new Subject<TState>();
  let idleTimerSub: ReturnType<typeof setTimeout> | null = null;

  function doSave(state: TState): Observable<unknown> {
    if (idleTimerSub !== null) {
      clearTimeout(idleTimerSub);
      idleTimerSub = null;
    }
    saveStatus.set('saving');
    return persist(state).pipe(
      tap(() => {
        isDirty.set(false);
        saveStatus.set('saved');
        // Plain setTimeout keeps the "Saved ✓" window independent of the
        // switchMap chain — a rapid subsequent save cannot cancel it.
        idleTimerSub = setTimeout(() => {
          saveStatus.set('idle');
          idleTimerSub = null;
        }, debounceMs);
      }),
      catchError(() => {
        saveStatus.set('error');
        return EMPTY;
      }),
    );
  }

  saveSubject
    .pipe(
      takeUntilDestroyed(destroyRef),
      debounceTime(debounceMs),
      switchMap((state) => doSave(state)),
    )
    .subscribe();

  return {
    isDirty,
    saveStatus,
    scheduleAutoSave(state: TState): void {
      isDirty.set(true);
      saveSubject.next(state);
    },
    saveNow(state: TState): void {
      isDirty.set(true);
      doSave(state).pipe(first()).subscribe();
    },
  };
}

