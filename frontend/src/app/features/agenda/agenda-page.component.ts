import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/api/api.service';
import { Appointment } from '../../core/models';
import { injectLocale } from '../../core/i18n/locale';

@Component({
  imports: [DatePipe, ButtonModule, TagModule, AvatarModule, TranslocoModule],
  templateUrl: './agenda-page.component.html',
  styleUrl: './agenda-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaPageComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  readonly locale = injectLocale();
  readonly appointments = signal<Appointment[]>([]);

  readonly upcoming = computed(() =>
    this.appointments()
      .filter((a) => a.status === 'booked' && new Date(a.startTime) >= new Date())
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );

  readonly today = computed(() => {
    const key = new Date().toDateString();
    return this.upcoming().filter((a) => new Date(a.startTime).toDateString() === key);
  });

  readonly authorized = computed(() => this.upcoming().filter((a) => a.clinicalDataAccessGranted));
  readonly completed = computed(() => this.appointments().filter((a) => a.status === 'completed'));

  constructor() {
    this.api.appointments().subscribe({ next: (d) => this.appointments.set(d), error: () => undefined });
  }

  patientName(a: Appointment) {
    return `${a.patient.user?.firstName ?? a.patient.firstName ?? this.transloco.translate('appointments.patientDefault')} ${a.patient.user?.lastName ?? a.patient.lastName ?? ''}`.trim();
  }

  initials(a: Appointment) {
    return this.patientName(a)
      .split(' ')
      .map((v) => v[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  openFolder(a: Appointment) {
    void this.router.navigate(['/app/patients', a.patient.id, 'folder'], { queryParams: { appointmentId: a.id } });
  }
}
