import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/api/api.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { PreferencesService, ThemePreference } from '../../core/preferences.service';

@Component({
  imports: [ReactiveFormsModule, ButtonModule, PasswordModule, SelectModule, AvatarModule, MessageModule, TranslocoModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly preferences = inject(PreferencesService);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  readonly saving = signal(false);

  readonly languages = [
    { label: 'Italiano', value: 'it' },
    { label: 'English', value: 'en' },
  ];

  private readonly themeLabels = toSignal(
    this.transloco.selectTranslateObject('settings'),
    { initialValue: {} },
  );

  readonly themes = computed(() => {
    const t = this.themeLabels() as Record<string, string>;
    return [
      { label: t['themeLight'] ?? '', value: 'light' },
      { label: t['themeDark'] ?? '', value: 'dark' },
      { label: t['themeSystem'] ?? '', value: 'system' },
    ];
  });

  readonly language = this.fb.nonNullable.control(this.preferences.language());
  readonly theme = this.fb.nonNullable.control<ThemePreference>(this.preferences.theme());

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  initials() {
    return `${this.auth.user()?.firstName?.[0] ?? ''}${this.auth.user()?.lastName?.[0] ?? ''}`.toUpperCase();
  }

  roleLabel() {
    return this.transloco.translate(`roles.${this.auth.role() ?? 'patient'}`);
  }

  changeLanguage() {
    this.preferences.setLanguage(this.language.value as 'it' | 'en');
    this.messages.add({ severity: 'success', summary: this.transloco.translate('settings.prefSavedToast') });
  }

  changeTheme() {
    this.preferences.setTheme(this.theme.value);
    this.messages.add({ severity: 'success', summary: this.transloco.translate('settings.themeUpdatedToast') });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.saving.set(true);
    this.api.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.passwordForm.reset();
        this.messages.add({ severity: 'success', summary: this.transloco.translate('settings.passwordUpdatedToast') });
      },
      error: (e) => {
        this.saving.set(false);
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('settings.passwordSummary'),
          detail: apiErrorMessage(e),
        });
      },
    });
  }
}
