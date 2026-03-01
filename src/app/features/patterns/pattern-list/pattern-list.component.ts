import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {PatternCardComponent} from '../pattern-card/pattern-card.component';
import {Pattern} from '../../../core/models/pattern.model';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, of, startWith} from 'rxjs';
import {map} from 'rxjs/operators';
import {AuthService} from '../../../core/services/auth.service';

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

  // Stream emits null while loading, then the pattern array (or [] on error).
  private readonly patterns$ = this.api.getPatterns().pipe(
    map((list) => list),
    catchError(() => of([] as Pattern[])),
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


