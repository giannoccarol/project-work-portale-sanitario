import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;
  const authenticatedRequest = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { expired: true } });
      }
      return throwError(() => error);
    }),
  );
};
