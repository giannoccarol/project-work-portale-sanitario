import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment, AppointmentStatus } from '../../../core/models';
import { apiErrorMessage } from '../../../core/api/api-error';
import { injectLocale } from '../../../core/i18n/locale';

@Component({
  imports: [DatePipe, ButtonModule, TagModule, SelectModule, CheckboxModule, FormsModule, TranslocoModule],
  templateUrl: './appointments-page.component.html',
  styleUrl: './appointments-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsPageComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  readonly locale = injectLocale();
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  statusFilter: AppointmentStatus | null = null;

  private readonly statuses = toSignal(this.transloco.selectTranslateObject('appointments.statuses'), {
    initialValue: {},
  });

  readonly statusOptions = computed(() =>
    Object.entries(this.statuses()).map(([value, label]) => ({ label: String(label), value: value as AppointmentStatus })),
  );

  readonly filtered = computed(() =>
    this.appointments()
      .filter((a) => !this.statusFilter || a.status === this.statusFilter)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
  );

  constructor() {
    this.reload();
  }

  reload() {
    this.loading.set(true);
    this.api.appointments(this.auth.role() === 'admin').subscribe({
      next: (d) => {
        this.appointments.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('appointments.summaryToast'),
          detail: apiErrorMessage(e),
        });
        this.loading.set(false);
      },
    });
  }

  counterpart(a: Appointment) {
    return this.auth.role() === 'doctor'
      ? `${a.patient.user?.firstName ?? a.patient.firstName ?? this.transloco.translate('appointments.patientDefault')} ${a.patient.user?.lastName ?? a.patient.lastName ?? ''}`
      : `${this.transloco.translate('directory.dr')} ${a.doctor.user.firstName ?? ''} ${a.doctor.user.lastName ?? ''}`;
  }

  statusLabel(s: AppointmentStatus) {
    return this.transloco.translate(`appointments.status.${s}`);
  }

  statusSeverity(s: AppointmentStatus): 'info' | 'success' | 'danger' {
    return { booked: 'info', completed: 'success', cancelled: 'danger' }[s] as 'info' | 'success' | 'danger';
  }

  toggleAccess(item: Appointment, event: { checked?: boolean }) {
    const granted = !!event.checked;
    this.api.setClinicalAccess(item.id, granted).subscribe({
      next: (updated) => this.appointments.update((items) => items.map((a) => (a.id === updated.id ? updated : a))),
      error: (e) => {
        this.appointments.update((items) => items.map((a) => (a.id === item.id ? { ...a, clinicalDataAccessGranted: !granted } : a)));
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('appointments.shareErrorToast'),
          detail: apiErrorMessage(e),
        });
      },
    });
  }

  cancel(item: Appointment) {
    if (!confirm(this.transloco.translate('appointments.cancelConfirm'))) return;
    this.api.cancelAppointment(item.id).subscribe({
      next: (updated) => {
        this.appointments.update((items) => items.map((a) => (a.id === updated.id ? updated : a)));
        this.messages.add({ severity: 'success', summary: this.transloco.translate('appointments.cancelledToast') });
      },
      error: (e) =>
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('appointments.cancelErrorToast'),
          detail: apiErrorMessage(e),
        }),
    });
  }

  goDoctors() {
    void this.router.navigateByUrl('/app/booking');
  }

  openFolder(item: Appointment) {
    void this.router.navigate(['/app/patients', item.patient.id, 'folder'], {
      queryParams: { appointmentId: item.id },
    });
  }

  openDetail(item: Appointment) {
    void this.router.navigate(['/app/appointments', item.id]);
  }
}
