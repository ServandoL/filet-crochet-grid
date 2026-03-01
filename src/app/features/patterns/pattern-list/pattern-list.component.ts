import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {PatternCardComponent} from '../pattern-card/pattern-card.component';
import {Pattern} from '../../../core/models/pattern.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {tap} from 'rxjs/operators';
import {catchError, EMPTY} from 'rxjs';
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
  private readonly destroy = inject(DestroyRef);
  private readonly auth = inject(AuthService);

  readonly patterns = signal<Pattern[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.titleService.setTitle('My Patterns — Filet Crochet Grid');
    this.api.getPatterns().pipe(takeUntilDestroyed(this.destroy),
      tap(list => {
        this.patterns.set(list);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        return EMPTY
      })
    ).subscribe();
  }

  onDeleted(id: string): void {
    this.patterns.update((list) => list.filter((p) => p._id !== id));
  }

  onLogout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
