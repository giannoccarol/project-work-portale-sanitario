import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  imports: [RouterLink, ButtonModule, CardModule, TranslocoModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly router = inject(Router);

  readonly services = [
    {
      titleKey: 'home.bookingsTitle',
      textKey: 'home.bookingsText',
      icon: 'pi pi-calendar-plus',
      route: '/doctors',
    },
    {
      titleKey: 'home.reportsTitle',
      textKey: 'home.reportsText',
      icon: 'pi pi-file-check',
      route: '/login',
    },
    {
      titleKey: 'home.folderTitle',
      textKey: 'home.folderText',
      icon: 'pi pi-folder-open',
      route: '/login',
    },
  ];

  go(url: string) {
    void this.router.navigateByUrl(url);
  }
}
