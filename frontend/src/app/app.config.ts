import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { MessageService } from 'primeng/api';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { TranslatedTitleStrategy } from './core/i18n/translated-title.strategy';
import { PreferencesService } from './core/preferences.service';

const PugliaSalutePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#14b8a6',
      500: '#0f766e',
      600: '#0d6b63',
      700: '#115e59',
      800: '#134e4a',
      900: '#0f403b',
      950: '#062e2b',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: PugliaSalutePreset,
        options: { darkModeSelector: '.app-dark', cssLayer: { name: 'primeng', order: 'base, primeng, utilities' } },
      },
    }),
    provideTransloco({
      config: { availableLangs: ['it', 'en'], defaultLang: 'it', fallbackLang: 'it', reRenderOnLangChange: true },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => inject(AuthService).restore()),
    provideAppInitializer(() => inject(PreferencesService).initialize()),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    MessageService,
  ],
};
