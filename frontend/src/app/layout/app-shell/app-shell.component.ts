import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { BrandComponent } from '../brand/brand.component';

interface NavigationItem {
  labelKey: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    DrawerModule,
    TranslocoModule,
    BrandComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly auth = inject(AuthService);

  readonly drawerOpen = signal(false);

  private readonly items: NavigationItem[] = [
    { labelKey: 'nav.dashboard', icon: 'pi pi-home', route: '/app/dashboard' },
    { labelKey: 'nav.appointments', icon: 'pi pi-calendar', route: '/app/appointments' },
    { labelKey: 'nav.folder', icon: 'pi pi-folder', route: '/app/folder', roles: ['patient'] },
    { labelKey: 'nav.reports', icon: 'pi pi-file', route: '/app/reports' },
    { labelKey: 'nav.reviews', icon: 'pi pi-star', route: '/app/reviews', roles: ['patient'] },
    { labelKey: 'nav.agenda', icon: 'pi pi-clock', route: '/app/agenda', roles: ['doctor'] },
    { labelKey: 'nav.admin', icon: 'pi pi-building', route: '/app/admin', roles: ['admin'] },
    { labelKey: 'nav.settings', icon: 'pi pi-cog', route: '/app/settings' },
  ];

  readonly navigation = computed(() =>
    this.items.filter((item) => !item.roles || item.roles.includes(this.auth.role() ?? '')),
  );

  readonly fullName = computed(
    () => `${this.auth.user()?.firstName ?? ''} ${this.auth.user()?.lastName ?? ''}`.trim(),
  );

  readonly initials = computed(
    () => `${this.auth.user()?.firstName?.[0] ?? ''}${this.auth.user()?.lastName?.[0] ?? ''}`.toUpperCase() || 'U',
  );

  readonly roleKey = computed(
    () => ({ patient: 'roles.patient', doctor: 'roles.doctor', admin: 'roles.admin' })[this.auth.role() ?? 'patient'],
  );
}
