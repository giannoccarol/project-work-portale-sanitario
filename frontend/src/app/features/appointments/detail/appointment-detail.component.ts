import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment, Report } from '../../../core/models';
import { apiErrorMessage } from '../../../core/api/api-error';
import { injectLocale } from '../../../core/i18n/locale';

@Component({
  imports: [DatePipe, ButtonModule, TagModule, MessageModule, TranslocoModule],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly transloco = inject(TranslocoService);
  readonly auth = inject(AuthService);
  readonly locale = injectLocale();
  readonly appointment = signal<Appointment | null>(null);
  readonly report = signal<Report | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set(this.transloco.translate('appointments.detailUnavailable'));
      this.loading.set(false);
      return;
    }
    forkJoin({ appointment: this.api.appointment(id), reports: this.api.reports(this.auth.role() === 'admin') }).subscribe({
      next: ({ appointment, reports }) => {
        this.appointment.set(appointment);
        this.report.set(reports.find((item) => item.appointment.id === appointment.id) ?? null);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e, this.transloco.translate('appointments.detailUnavailable')));
        this.loading.set(false);
      },
    });
  }

  counterpart() {
    const appointment = this.appointment();
    if (!appointment) return '';
    return this.auth.role() === 'doctor'
      ? `${appointment.patient.user?.firstName ?? appointment.patient.firstName ?? ''} ${appointment.patient.user?.lastName ?? appointment.patient.lastName ?? ''}`.trim()
      : `${this.transloco.translate('directory.dr')} ${appointment.doctor.user.firstName ?? ''} ${appointment.doctor.user.lastName ?? ''}`.trim();
  }

  statusLabel() {
    return this.appointment() ? this.transloco.translate(`appointments.status.${this.appointment()!.status}`) : '';
  }

  statusSeverity(): 'info' | 'success' | 'danger' {
    return ({ booked: 'info', completed: 'success', cancelled: 'danger' } as const)[this.appointment()?.status ?? 'booked'];
  }

  openReport() {
    const report = this.report();
    if (report) void this.router.navigate(['/app/reports', report.id]);
  }

  openFolder() {
    const appointment = this.appointment();
    if (!appointment) return;
    if (this.auth.role() === 'doctor') {
      void this.router.navigate(['/app/patients', appointment.patient.id, 'folder'], {
        queryParams: { appointmentId: appointment.id },
      });
    } else {
      void this.router.navigateByUrl('/app/folder');
    }
  }

  back() {
    void this.router.navigateByUrl('/app/appointments');
  }
}
