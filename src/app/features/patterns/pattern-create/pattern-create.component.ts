import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {catchError, first, of} from 'rxjs';
import {tap} from 'rxjs/operators';

const integerValidator: ValidatorFn = (control: AbstractControl) => {
  const val = control.value;
  if (val === null || val === '') return null;
  return Number.isInteger(Number(val)) ? null : {integer: true};
};

@Component({
  selector: 'app-pattern-create',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 class="text-xl font-semibold text-gray-900 mb-6">New Pattern</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">

          <!-- Name -->
          <div class="flex flex-col gap-1">
            <label for="name" class="text-sm font-medium text-gray-700">Pattern name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              autocomplete="off"
              class="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2
                     focus:ring-indigo-500 focus:border-indigo-500"
              [class.border-red-500]="fieldInvalid('name')"
              [class.border-gray-300]="!fieldInvalid('name')"
              aria-describedby="name-error"
            />
            @if (fieldInvalid('name')) {
              <p id="name-error" class="text-xs text-red-600" role="alert">Name is required.</p>
            }
          </div>

          <!-- Rows + Cols -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label for="rows" class="text-sm font-medium text-gray-700">Rows</label>
              <input
                id="rows"
                type="number"
                formControlName="rows"
                min="1"
                class="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2
                       focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-500]="fieldInvalid('rows')"
                [class.border-gray-300]="!fieldInvalid('rows')"
                aria-describedby="rows-error"
              />
              @if (fieldInvalid('rows')) {
                <p id="rows-error" class="text-xs text-red-600" role="alert">
                  @if (form.controls.rows.hasError('required')) {
                    Required.
                  } @else {
                    Must be a positive whole number.
                  }
                </p>
              }
            </div>

            <div class="flex flex-col gap-1">
              <label for="cols" class="text-sm font-medium text-gray-700">Columns</label>
              <input
                id="cols"
                type="number"
                formControlName="cols"
                min="1"
                class="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2
                       focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-500]="fieldInvalid('cols')"
                [class.border-gray-300]="!fieldInvalid('cols')"
                aria-describedby="cols-error"
              />
              @if (fieldInvalid('cols')) {
                <p id="cols-error" class="text-xs text-red-600" role="alert">
                  @if (form.controls.cols.hasError('required')) {
                    Required.
                  } @else {
                    Must be a positive whole number.
                  }
                </p>
              }
            </div>
          </div>

          @if (apiError()) {
            <p class="text-sm text-red-600" role="alert">{{ apiError() }}</p>
          }

          <div class="flex gap-3 pt-1">
            <button
              type="button"
              (click)="onCancel()"
              class="flex-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium
                     py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400
                     transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="loading()"
              class="flex-1 rounded-lg bg-indigo-600 text-white text-sm font-medium py-2
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
                     focus:ring-offset-2 disabled:opacity-50 transition"
            >
              {{ loading() ? 'Creating…' : 'Create Pattern' }}
            </button>
          </div>

        </form>
      </div>
    </main>
  `,
})
export class PatternCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PatternApiService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    rows: [20, [Validators.required, Validators.min(1), integerValidator]],
    cols: [30, [Validators.required, Validators.min(1), integerValidator]],
  });

  readonly loading = signal(false);
  readonly apiError = signal<string | null>(null);
  private readonly _submitted = signal(false);

  fieldInvalid(field: 'name' | 'rows' | 'cols'): boolean {
    const ctrl = this.form.controls[field];
    return ctrl.invalid && (ctrl.dirty || ctrl.touched || this._submitted());
  }

  onSubmit(): void {
    this._submitted.set(true);
    this.apiError.set(null);
    if (this.form.invalid) return;

    this.loading.set(true);
    const {name, rows, cols} = this.form.getRawValue();

    this.api.createPattern({name, rows: Number(rows), cols: Number(cols)}).pipe(first(), tap(pattern =>
      void this.router.navigate(['/patterns', pattern._id], {queryParams: {mode: 'edit'}})), catchError(err => {
      this.loading.set(false);
      this.apiError.set(err?.error?.message ?? 'Could not create pattern. Try again.');
      return of(undefined);
    })).subscribe();
  }

  onCancel(): void {
    void this.router.navigate(['/patterns']);
  }
}

