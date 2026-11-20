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

/**
 * The saved token, or null when storage is unavailable or blocked. The auth interceptor reads it
 * on every request, so a throw here would fail every request in the app.
 */
function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _token = signal<string | null>(readToken());
  private readonly _currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly currentUser = this._currentUser.asReadonly();

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          try {
            localStorage.setItem(TOKEN_KEY, res.token);
          } catch {
            // Signed in for this visit only.
          }
          this._token.set(res.token);
          this._currentUser.set(res.user);
        }),
      );
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nothing saved to remove.
    }
    this._token.set(null);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return this._token();
  }
}

