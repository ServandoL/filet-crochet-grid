import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {PatternCardComponent} from '../pattern-card/pattern-card.component';
import {Pattern} from '../../../core/models/pattern.model';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, debounceTime, EMPTY, merge, of, startWith} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {HouseholdEvents} from '@home/ui/realtime';
import {AuthService} from '../../../core/services/auth.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-pattern-list',
  imports: [PatternCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pattern-list.component.html',
})
export class PatternListComponent implements OnInit {
  private readonly api = inject(PatternApiService);
  protected readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly auth = inject(AuthService);
  private readonly events = inject(HouseholdEvents);
  public env = environment;

  // Stream emits null while loading, then the pattern array (or [] on error). It refetches when
  // another device changes a pattern or the event stream reconnects; a failed refetch keeps the list.
  private readonly patterns$ = merge(
    of(undefined),
    merge(this.events.on('patterns'), this.events.resync).pipe(debounceTime(250)),
  ).pipe(
    switchMap((_, i) => this.api.getPatterns().pipe(catchError(() => (i === 0 ? of([] as Pattern[]) : EMPTY)))),
    startWith(null),
  );

  private readonly _patternsResult = toSignal(this.patterns$);

  readonly loading = computed(() => this._patternsResult() === null);
  readonly patterns = computed(() => this._patternsResult() ?? []);

  // Local override signal so deletions are reflected immediately without refetch.
  private readonly _deleted = signal<string[]>([]);
  readonly visiblePatterns = computed(() =>
    this.patterns().filter((p) => !this._deleted().includes(p._id)),
  );

  ngOnInit(): void {
    this.titleService.setTitle('My Patterns — Filet Crochet Grid');
  }

  onDeleted(id: string): void {
    this._deleted.update((ids) => [...ids, id]);
  }

  onLogout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}


