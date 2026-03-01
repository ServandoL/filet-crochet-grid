import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {AuthService} from '../../../core/services/auth.service';
import {catchError, EMPTY, first} from 'rxjs';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
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
    const {email, password} = this.form.getRawValue();

    this.auth.login(email, password).pipe(first(), tap(() => void this.router.navigate(['/patterns'])), catchError(error => {
      this.loading.set(false);
      this.apiError.set(error?.message ?? 'Invalid email or password.');
      return EMPTY;
    })).subscribe()

    ;
  }
}

