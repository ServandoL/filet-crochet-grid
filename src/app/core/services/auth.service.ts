import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'fcg_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly currentUser = this._currentUser.asReadonly();

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          this._token.set(res.token);
          this._currentUser.set(res.user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return this._token();
  }
}

