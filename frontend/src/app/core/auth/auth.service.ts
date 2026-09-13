import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { AuthResponse, User, UserRole } from '../models';
import { ApiService } from '../api/api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly tokenKey = 'puglia-salute.token';
  private readonly userState = signal<User | null>(null);
  private readonly readyState = signal(false);
  readonly user = this.userState.asReadonly();
  readonly ready = this.readyState.asReadonly();
  readonly authenticated = computed(() => !!this.userState());
  readonly role = computed<UserRole | null>(() => this.userState()?.role ?? null);

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  restore(): Observable<User | null> {
    if (!this.token) {
      this.readyState.set(true);
      return of(null);
    }
    return this.api.getMe().pipe(
      tap((user) => this.userState.set(user)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
      finalize(() => this.readyState.set(true)),
    );
  }

  login(body: { email: string; password: string }) {
    return this.http.post<AuthResponse>('/api/v1/auth/login', body).pipe(tap((result) => this.setSession(result)));
  }

  register(body: Record<string, string>) {
    return this.http.post<AuthResponse>('/api/v1/auth/register', body).pipe(tap((result) => this.setSession(result)));
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/');
  }

  private setSession(result: AuthResponse): void {
    localStorage.setItem(this.tokenKey, result.token);
    this.userState.set(result.user);
    this.readyState.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    this.userState.set(null);
  }
}
