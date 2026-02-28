import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
          🧶 Filet Crochet Grid
        </h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">

          <!-- Email -->
          <div class="flex flex-col gap-1">
            <label for="email" class="text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              [class.border-red-500]="emailInvalid()"
              [class.border-gray-300]="!emailInvalid()"
              aria-describedby="email-error"
            />
            @if (emailInvalid()) {
              <p id="email-error" class="text-xs text-red-600" role="alert">
                @if (email.hasError('required')) { Email is required. }
                @else if (email.hasError('email')) { Enter a valid email address. }
              </p>
            }
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-1">
            <label for="password" class="text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              class="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              [class.border-red-500]="passwordInvalid()"
              [class.border-gray-300]="!passwordInvalid()"
              aria-describedby="password-error"
            />
            @if (passwordInvalid()) {
              <p id="password-error" class="text-xs text-red-600" role="alert">
                Password is required.
              </p>
            }
          </div>

          <!-- API error -->
          @if (apiError()) {
            <p class="text-sm text-red-600 text-center" role="alert">{{ apiError() }}</p>
          }

          <button
            type="submit"
            class="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium
                   hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
                   focus:ring-offset-2 disabled:opacity-50 transition"
            [disabled]="loading()"
          >
            {{ loading() ? 'Signing in…' : 'Log In' }}
          </button>

        </form>
      </div>
    </main>
  `,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);

  ngOnInit(): void {
    this.titleService.setTitle('Log In — Filet Crochet Grid');
  }

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly apiError = signal<string | null>(null);

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  emailInvalid() {
    return this.email.invalid && (this.email.dirty || this.email.touched || this.submitted());
  }

  passwordInvalid() {
    return (
      this.password.invalid && (this.password.dirty || this.password.touched || this.submitted())
    );
  }

  private readonly _submitted = signal(false);
  submitted() {
    return this._submitted();
  }

  onSubmit(): void {
    this._submitted.set(true);
    this.apiError.set(null);

    if (this.form.invalid) return;

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/patterns']),
      error: (err) => {
        this.loading.set(false);
        this.apiError.set(err?.error?.message ?? 'Invalid email or password.');
      },
    });
  }
}

