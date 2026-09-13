import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole } from '../models';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const decide = () =>
    auth.authenticated() || router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  return auth.ready() ? decide() : auth.restore().pipe(map(decide));
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as UserRole[];
  return roles.includes(auth.role() as UserRole) ? true : router.createUrlTree(['/app/dashboard']);
};
