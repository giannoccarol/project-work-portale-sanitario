import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { BrandComponent } from '../brand/brand.component';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, DrawerModule, TranslocoModule, BrandComponent],
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicShellComponent {
  readonly auth = inject(AuthService);
  readonly drawerOpen = signal(false);

  private readonly router = inject(Router);

  go(url: string) {
    void this.router.navigateByUrl(url);
  }

  goApp(url: string) {
    this.drawerOpen.set(false);
    this.go(url);
  }
}
