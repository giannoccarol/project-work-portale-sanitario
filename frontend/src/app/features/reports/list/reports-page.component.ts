import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment, Report } from '../../../core/models';
import { apiErrorMessage } from '../../../core/api/api-error';
import { injectLocale } from '../../../core/i18n/locale';

@Component({
  imports: [DatePipe, FormsModule, ButtonModule, CardModule, SelectModule, FileUploadModule, DialogModule, InputTextModule, TextareaModule, TagModule, TranslocoModule],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  readonly locale = injectLocale();
  readonly reports = signal<Report[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  dialogOpen = false;
  file?: File;
  draft = { appointmentId: '', diagnosis: '', prescriptions: '', notes: '' };

  readonly reportableAppointments = computed(() =>
    this.appointments().filter((a) => a.status === 'booked' && !this.reports().some((r) => r.appointment.id === a.id)),
  );

  constructor() {
    this.reload();
    if (this.auth.role() === 'doctor')
      this.api.appointments().subscribe({ next: (d) => this.appointments.set(d), error: () => undefined });
  }

  reload() {
    this.api.reports(this.auth.role() === 'admin').subscribe({
      next: (d) => {
        this.reports.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('reports.summaryToast'),
          detail: apiErrorMessage(e),
        });
        this.loading.set(false);
      },
    });
  }

  counterpart(r: Report) {
    return this.auth.role() === 'patient'
      ? `${this.transloco.translate('directory.dr')} ${r.doctor.user.firstName ?? ''} ${r.doctor.user.lastName ?? ''}`
      : this.personName(r.patient);
  }

  patientName(a: Appointment) {
    return this.personName(a.patient);
  }

  personName(p: Report['patient']) {
    return `${p?.user?.firstName ?? p?.firstName ?? this.transloco.translate('appointments.patientDefault')} ${p?.user?.lastName ?? p?.lastName ?? ''}`.trim();
  }

  openNew() {
    this.draft = { appointmentId: '', diagnosis: '', prescriptions: '', notes: '' };
    this.file = undefined;
    this.dialogOpen = true;
  }

  setFile(e: { files: File[] }) {
    this.file = e.files[0];
  }

  saveDraft() {
    this.saving.set(true);
    const form = new FormData();
    form.append('diagnosis', this.draft.diagnosis);
    form.append('prescriptions', this.draft.prescriptions);
    form.append('notes', this.draft.notes);
    if (this.file) form.append('attachment', this.file);
    this.api.createReport(this.draft.appointmentId, form).subscribe({
      next: (r) => {
        this.reports.update((v) => [r, ...v]);
        this.dialogOpen = false;
        this.saving.set(false);
        this.messages.add({ severity: 'success', summary: this.transloco.translate('reports.savedToast') });
      },
      error: (e) => {
        this.saving.set(false);
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('reports.saveErrorToast'),
          detail: apiErrorMessage(e),
        });
      },
    });
  }

  publish(r: Report) {
    if (!confirm(this.transloco.translate('reports.publishConfirm'))) return;
    this.api.publishReport(r.id).subscribe({
      next: (u) => {
        this.reports.update((v) => v.map((x) => (x.id === u.id ? u : x)));
        this.messages.add({ severity: 'success', summary: this.transloco.translate('reports.publishedToast') });
      },
      error: (e) =>
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('reports.publicationSummary'),
          detail: apiErrorMessage(e),
        }),
    });
  }

  download(r: Report) {
    this.api.downloadReport(r.id).subscribe({
      next: (response) => {
        const url = URL.createObjectURL(response.body!);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.transloco.translate('reports.filePrefix')}-${r.id}`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (e) =>
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('reports.downloadSummary'),
          detail: apiErrorMessage(e),
        }),
    });
  }

  openDetail(r: Report) {
    void this.router.navigate(['/app/reports', r.id]);
  }
}
