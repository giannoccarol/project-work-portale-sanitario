import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Report } from '../../../core/models';
import { apiErrorMessage } from '../../../core/api/api-error';
import { injectLocale } from '../../../core/i18n/locale';

@Component({
  imports: [DatePipe, FormsModule, ButtonModule, TagModule, TextareaModule, MessageModule, FileUploadModule, TranslocoModule],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  readonly auth = inject(AuthService);
  readonly locale = injectLocale();
  readonly report = signal<Report | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  file?: File;
  draft = { diagnosis: '', prescriptions: '', notes: '' };

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set(this.transloco.translate('reports.detailUnavailable'));
      this.loading.set(false);
      return;
    }
    this.api.report(id).subscribe({
      next: (report) => {
        this.report.set(report);
        this.draft = {
          diagnosis: report.diagnosis ?? '',
          prescriptions: report.prescriptions ?? '',
          notes: report.notes ?? '',
        };
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e, this.transloco.translate('reports.detailUnavailable')));
        this.loading.set(false);
      },
    });
  }

  personName(report: Report) {
    const person = this.auth.role() === 'patient' ? report.doctor.user : report.patient.user;
    return `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim();
  }

  statusLabel() {
    return this.report()?.status === 'published'
      ? this.transloco.translate('reports.published')
      : this.transloco.translate('reports.draft');
  }

  setFile(event: { files: File[] }) {
    this.file = event.files[0];
  }

  save() {
    const report = this.report();
    if (!report || report.status !== 'draft') return;
    this.saving.set(true);
    const form = new FormData();
    form.append('diagnosis', this.draft.diagnosis);
    form.append('prescriptions', this.draft.prescriptions);
    form.append('notes', this.draft.notes);
    if (this.file) form.append('attachment', this.file);
    this.api.updateReport(report.id, form).subscribe({
      next: (updated) => {
        this.report.set(updated);
        this.file = undefined;
        this.saving.set(false);
        this.messages.add({ severity: 'success', summary: this.transloco.translate('reports.updatedToast') });
      },
      error: (e) => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: this.transloco.translate('reports.saveErrorToast'), detail: apiErrorMessage(e) });
      },
    });
  }

  publish() {
    const report = this.report();
    if (!report || !confirm(this.transloco.translate('reports.publishConfirm'))) return;
    this.api.publishReport(report.id).subscribe({
      next: (updated) => {
        this.report.set(updated);
        this.messages.add({ severity: 'success', summary: this.transloco.translate('reports.publishedToast') });
      },
      error: (e) => this.messages.add({ severity: 'error', summary: this.transloco.translate('reports.publicationSummary'), detail: apiErrorMessage(e) }),
    });
  }

  download() {
    const report = this.report();
    if (!report) return;
    this.api.downloadReport(report.id).subscribe({
      next: (response) => {
        const url = URL.createObjectURL(response.body!);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.transloco.translate('reports.filePrefix')}-${report.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => this.messages.add({ severity: 'error', summary: this.transloco.translate('reports.downloadSummary'), detail: apiErrorMessage(e) }),
    });
  }

  back() {
    void this.router.navigateByUrl('/app/reports');
  }
}
