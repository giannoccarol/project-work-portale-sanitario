import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private snapshot?: RouterStateSnapshot;

  constructor() {
    super();
    this.transloco.langChanges$.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.snapshot) this.updateTitle(this.snapshot);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot) {
    this.snapshot = snapshot;
    const key = this.buildTitle(snapshot);
    if (key !== undefined) this.title.setTitle(this.transloco.translate(key));
  }
}
