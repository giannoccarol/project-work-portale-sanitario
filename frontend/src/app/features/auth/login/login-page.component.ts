import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, MessageModule, TranslocoModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly transloco = inject(TranslocoService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly expired = signal(this.route.snapshot.queryParamMap.get('expired') === 'true');
  readonly returnUrl = this.safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  invalid(name: 'email' | 'password') {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl(this.returnUrl),
      error: (error) => {
        this.error.set(apiErrorMessage(error, this.transloco.translate('login.invalidCredentials')));
        this.loading.set(false);
      },
    });
  }

  private safeReturnUrl(value: string | null) {
    return value?.startsWith('/') && !value.startsWith('//') ? value : '/app/dashboard';
  }
}
