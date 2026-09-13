import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export function injectLocale(): Signal<string> {
  const transloco = inject(TranslocoService);
  return toSignal(transloco.langChanges$, { initialValue: transloco.getActiveLang() });
}
