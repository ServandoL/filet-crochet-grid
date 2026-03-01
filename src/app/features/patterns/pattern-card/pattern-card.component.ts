import {ChangeDetectionStrategy, Component, inject, input, output, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Pattern} from '../../../core/models/pattern.model';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {catchError, EMPTY, first} from 'rxjs';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-pattern-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pattern-card.component.html',
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
    return new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'}).format(
      new Date(this.pattern().updatedAt),
    );
  }

  onEdit() {
    void this.router.navigate(['/patterns', this.pattern()._id], {queryParams: {mode: 'edit'}});
  }

  onView() {
    void this.router.navigate(['/patterns', this.pattern()._id], {queryParams: {mode: 'view'}});
  }

  onDeleteConfirmed() {
    this.deleting.set(true);
    this.deleteError.set(null);
    this.api.deletePattern(this.pattern()._id).pipe(first(), tap(() => {
      this.confirmingDelete.set(false);
      this.deleted.emit(this.pattern()._id);
    }), catchError(err => {
      this.deleting.set(false);
      this.deleteError.set(err?.error?.message ?? 'Could not delete. Try again.');
      return EMPTY;
    })).subscribe();
  }
}

