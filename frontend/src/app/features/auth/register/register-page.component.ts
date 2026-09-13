import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Structure } from '../../../core/models';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    MessageModule,
    DatePickerModule,
    TranslocoModule,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly structures = signal<Structure[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly today = new Date();

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    fiscalCode: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{16}$/)]],
    birthDate: [null as Date | null, Validators.required],
    structureId: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.api
      .structures()
      .subscribe({ next: (data) => this.structures.set(data), error: (e) => this.error.set(apiErrorMessage(e)) });
  }

  invalid(name: keyof typeof this.form.controls) {
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
    const value = this.form.getRawValue();
    this.auth
      .register({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        fiscalCode: value.fiscalCode.toUpperCase(),
        birthDate: this.formatBirthDate(value.birthDate),
        structureId: value.structureId,
        password: value.password,
      })
      .subscribe({
      next: () => {
        const value = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(value?.startsWith('/') && !value.startsWith('//') ? value : '/app/dashboard');
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        this.loading.set(false);
      },
      });
  }

  private formatBirthDate(date: Date | null) {
    if (!date) return '';
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
}
