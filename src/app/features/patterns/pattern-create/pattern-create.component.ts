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
  templateUrl: './pattern-create.component.html',
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

