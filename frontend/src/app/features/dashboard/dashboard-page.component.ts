import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Appointment, Report } from '../../core/models';
import { injectLocale } from '../../core/i18n/locale';

interface QuickLink {
  label: string;
  text: string;
  icon: string;
  route: string;
}

interface QuickLinkDef {
  icon: string;
  route: string;
  key: string;
}

@Component({
  imports: [DatePipe, RouterLink, ButtonModule, TagModule, TranslocoModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  readonly locale = injectLocale();
  readonly appointments = signal<Appointment[]>([]);
  readonly reports = signal<Report[]>([]);

  private readonly lang = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });

  readonly firstName = computed(() => this.auth.user()?.firstName || this.transloco.translate('dashboard.hello'));

  readonly upcoming = computed(() =>
    this.appointments()
      .filter((a) => a.status === 'booked' && new Date(a.startTime) > new Date())
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );

  readonly completed = computed(() => this.appointments().filter((a) => a.status === 'completed'));
  readonly publishedReports = computed(() => this.reports().filter((r) => r.status === 'published').length);
  readonly accessGranted = computed(() => this.appointments().filter((a) => a.clinicalDataAccessGranted).length);

  private readonly greetingKey = computed(() => {
    const hour = new Date().getHours();
    return hour < 13 ? 'dashboard.morning' : hour < 18 ? 'dashboard.afternoon' : 'dashboard.evening';
  });

  readonly greeting = computed(() => this.t(this.greetingKey()));

  private readonly subtitleKey = computed(() =>
    this.auth.role() === 'doctor'
      ? 'dashboard.subtitleDoctor'
      : this.auth.role() === 'admin'
        ? 'dashboard.subtitleAdmin'
        : 'dashboard.subtitlePatient',
  );

  readonly subtitle = computed(() => this.t(this.subtitleKey()));

  private readonly quickLinkDefs = computed<QuickLinkDef[]>(() =>
    this.auth.role() === 'patient'
      ? [
          { icon: 'pi pi-search', route: '/doctors', key: 'findDoctor' },
          { icon: 'pi pi-folder', route: '/app/folder', key: 'folder' },
          { icon: 'pi pi-file', route: '/app/reports', key: 'reports' },
        ]
      : this.auth.role() === 'doctor'
        ? [
            { icon: 'pi pi-clock', route: '/app/agenda', key: 'agenda' },
            { icon: 'pi pi-calendar', route: '/app/appointments', key: 'appointments' },
            { icon: 'pi pi-file-edit', route: '/app/reports', key: 'reports' },
          ]
        : [
            { icon: 'pi pi-building', route: '/app/admin', key: 'admin' },
            { icon: 'pi pi-calendar', route: '/app/appointments', key: 'appointments' },
            { icon: 'pi pi-file', route: '/app/reports', key: 'reports' },
          ],
  );

  private readonly linkTranslations = toSignal(
    this.transloco.selectTranslateObject('dashboard.links'),
    { initialValue: {} },
  );

  readonly quickLinks = computed<QuickLink[]>(() => {
    const role = this.auth.role() ?? 'patient';
    const links = (this.linkTranslations() as Record<string, Record<string, { label?: string; text?: string }>>)[role] ?? {};
    return this.quickLinkDefs().map(({ icon, route, key }) => ({
      label: links[key]?.label ?? '',
      text: links[key]?.text ?? '',
      icon,
      route,
    }));
  });

  constructor() {
    this.api
      .appointments(this.auth.role() === 'admin')
      .subscribe({ next: (d) => this.appointments.set(d), error: () => undefined });
    this.api
      .reports(this.auth.role() === 'admin')
      .subscribe({ next: (d) => this.reports.set(d), error: () => undefined });
  }

  counterpart(a: Appointment) {
    return this.auth.role() === 'doctor'
      ? `${a.patient.user?.firstName ?? a.patient.firstName ?? ''} ${a.patient.user?.lastName ?? a.patient.lastName ?? ''}`
      : `${this.transloco.translate('directory.dr')} ${a.doctor.user.firstName ?? ''} ${a.doctor.user.lastName ?? ''}`;
  }

  goDoctors() {
    void this.router.navigateByUrl('/app/booking');
  }

  private t(key: string) {
    void this.lang();
    return this.transloco.translate(key);
  }
}
