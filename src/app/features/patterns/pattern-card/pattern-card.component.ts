import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Pattern } from '../../../core/models/pattern.model';
import { PatternApiService } from '../../../core/services/pattern-api.service';

@Component({
  selector: 'app-pattern-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4
             hover:shadow-md transition-shadow"
    >
      <div>
        <h2 class="text-base font-semibold text-gray-900 truncate">{{ pattern().name }}</h2>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ pattern().rows }} × {{ pattern().cols }}
          &nbsp;·&nbsp;
          {{ lastEdited() }}
        </p>
      </div>

      <div class="flex gap-2 mt-auto">
        <button
          type="button"
          (click)="onEdit()"
          class="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm
                 font-medium py-1.5 hover:bg-indigo-100 focus:outline-none focus:ring-2
                 focus:ring-indigo-500 transition"
        >
          Edit
        </button>
        <button
          type="button"
          (click)="onView()"
          class="flex-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                 font-medium py-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2
                 focus:ring-gray-400 transition"
        >
          View
        </button>
        <button
          type="button"
          (click)="confirmingDelete.set(true)"
          class="rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium
                 px-3 py-1.5 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400
                 transition"
          aria-label="Delete pattern"
        >
          Delete
        </button>
      </div>

      @if (deleteError()) {
        <p class="text-xs text-red-600" role="alert">{{ deleteError() }}</p>
      }
    </article>

    <!-- Confirm delete dialog -->
    @if (confirmingDelete()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'dialog-title-' + pattern().id"
      >
        <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
          <h3
            [id]="'dialog-title-' + pattern().id"
            class="text-base font-semibold text-gray-900 mb-2"
          >
            Delete "{{ pattern().name }}"?
          </h3>
          <p class="text-sm text-gray-600 mb-6">This cannot be undone.</p>
          <div class="flex gap-3 justify-end">
            <button
              type="button"
              (click)="confirmingDelete.set(false)"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="onDeleteConfirmed()"
              [disabled]="deleting()"
              class="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500
                     disabled:opacity-50 transition"
            >
              {{ deleting() ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PatternCardComponent {
  private readonly api = inject(PatternApiService);
  private readonly router = inject(Router);

  readonly pattern = input.required<Pattern>();
  readonly deleted = output<string>();

  readonly confirmingDelete = signal(false);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  lastEdited() {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
      new Date(this.pattern().updatedAt),
    );
  }

  onEdit() {
    this.router.navigate(['/patterns', this.pattern().id], { queryParams: { mode: 'edit' } });
  }

  onView() {
    this.router.navigate(['/patterns', this.pattern().id], { queryParams: { mode: 'view' } });
  }

  onDeleteConfirmed() {
    this.deleting.set(true);
    this.deleteError.set(null);
    this.api.deletePattern(this.pattern().id).subscribe({
      next: () => {
        this.confirmingDelete.set(false);
        this.deleted.emit(this.pattern().id);
      },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(err?.error?.message ?? 'Could not delete. Try again.');
      },
    });
  }
}

