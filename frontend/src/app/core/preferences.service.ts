import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, tap } from 'rxjs';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly document = inject(DOCUMENT);
  private readonly transloco = inject(TranslocoService);
  readonly theme = signal<ThemePreference>('light');
  readonly language = signal<'it' | 'en'>('it');

  initialize(): Observable<unknown> {
    const storedTheme = localStorage.getItem('puglia-salute.theme') as ThemePreference | null;
    const storedLanguage = localStorage.getItem('puglia-salute.lang');
    const language = storedLanguage === 'en' ? 'en' : 'it';
    this.setTheme(storedTheme && ['light', 'dark', 'system'].includes(storedTheme) ? storedTheme : 'light', false);
    return this.transloco.load(language).pipe(tap(() => this.setLanguage(language, false)));
  }

  setTheme(theme: ThemePreference, persist = true): void {
    this.theme.set(theme);
    const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    this.document.documentElement.classList.toggle('app-dark', dark);
    if (persist) localStorage.setItem('puglia-salute.theme', theme);
  }

  setLanguage(language: 'it' | 'en', persist = true): void {
    this.language.set(language);
    this.transloco.setActiveLang(language);
    this.document.documentElement.lang = language;
    if (persist) localStorage.setItem('puglia-salute.lang', language);
  }
}
