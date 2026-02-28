import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PatternApiService } from '../../../core/services/pattern-api.service';
import { PatternCardComponent } from '../pattern-card/pattern-card.component';
import { Pattern } from '../../../core/models/pattern.model';

@Component({
  selector: 'app-pattern-list',
  imports: [PatternCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900">🧶 My Patterns</h1>
        <button
          type="button"
          (click)="router.navigate(['/patterns/new'])"
          class="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium
                 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
                 focus:ring-offset-2 transition"
        >
          + New Pattern
        </button>
      </header>

      <!-- Content -->
      <main class="max-w-4xl mx-auto px-4 py-8">
        @if (loading()) {
          <p class="text-center text-gray-500 text-sm mt-16">Loading…</p>
        } @else if (patterns().length === 0) {
          <div class="text-center mt-24">
            <p class="text-5xl mb-4">🧶</p>
            <p class="text-gray-600 font-medium">No patterns yet.</p>
            <p class="text-gray-400 text-sm mt-1">Create your first filet crochet pattern!</p>
            <button
              type="button"
              (click)="router.navigate(['/patterns/new'])"
              class="mt-6 rounded-lg bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
                     focus:ring-offset-2 transition"
            >
              + New Pattern
            </button>
          </div>
        } @else {
          <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            @for (pattern of patterns(); track pattern.id) {
              <li>
                <app-pattern-card
                  [pattern]="pattern"
                  (deleted)="onDeleted($event)"
                />
              </li>
            }
          </ul>
        }
      </main>
    </div>
  `,
})
export class PatternListComponent implements OnInit {
  private readonly api = inject(PatternApiService);
  protected readonly router = inject(Router);
  private readonly titleService = inject(Title);

  readonly patterns = signal<Pattern[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.titleService.setTitle('My Patterns — Filet Crochet Grid');
    this.api.getPatterns().subscribe({
      next: (list) => {
        this.patterns.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onDeleted(id: string): void {
    this.patterns.update((list) => list.filter((p) => p.id !== id));
  }
}
