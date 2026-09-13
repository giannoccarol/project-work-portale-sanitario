import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Appointment, ClinicalFolder, ClinicalFolderSection, Patient, Report, Review } from '../../core/models';
import { apiErrorMessage } from '../../core/api/api-error';

interface FolderSectionText {
  label: string;
  description: string;
}

@Component({
  imports: [DatePipe, TabsModule, MessageModule, TagModule, AvatarModule, ButtonModule, TranslocoModule],
  templateUrl: './clinical-folder-page.component.html',
  styleUrl: './clinical-folder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicalFolderPageComponent {
  readonly patientId = input<string>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  private readonly transloco = inject(TranslocoService);
  readonly folder = signal<ClinicalFolder | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly String = String;

  readonly patientName = computed(
    () =>
      `${this.folder()?.patient.user?.firstName ?? this.folder()?.patient.firstName ?? ''} ${this.folder()?.patient.user?.lastName ?? this.folder()?.patient.lastName ?? ''}`.trim() ||
      this.transloco.translate('folder.defaultPatient'),
  );

  private readonly sections = toSignal(this.transloco.selectTranslateObject('folder.sections'), {
    initialValue: {},
  });

  constructor() {
    queueMicrotask(() => {
      const request = this.patientId()
        ? this.api.patientFolder(this.patientId()!, this.route.snapshot.queryParamMap.get('appointmentId') ?? undefined)
        : this.api.myFolder();
      request.subscribe({
        next: (d) => {
          this.folder.set(d);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(apiErrorMessage(e, this.transloco.translate('folder.unavailable')));
          this.loading.set(false);
        },
      });
    });
  }

  initials() {
    return this.patientName()
      .split(' ')
      .map((v) => v[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  structureName() {
    const structure = this.folder()?.patient.structure;
    return typeof structure === 'string' ? structure : (structure?.name ?? '—');
  }

  section(key: string): FolderSectionText {
    const map = this.sections() as Record<string, FolderSectionText>;
    return (
      map[key] ?? { label: key, description: this.transloco.translate('folder.defaultDescription') }
    );
  }

  label(key: string) {
    return this.section(key).label;
  }

  description(key: string) {
    return this.section(key).description;
  }

  patientData(section: ClinicalFolderSection): Patient | null {
    return section.key === 'anagrafica' && section.data && typeof section.data === 'object'
      ? (section.data as Patient)
      : null;
  }

  appointmentData(section: ClinicalFolderSection): Appointment[] {
    return section.key === 'appuntamenti' && Array.isArray(section.data) ? (section.data as Appointment[]) : [];
  }

  reportData(section: ClinicalFolderSection): Report[] {
    return section.key === 'referti' && Array.isArray(section.data) ? (section.data as Report[]) : [];
  }

  reviewData(section: ClinicalFolderSection): Review[] {
    return section.key === 'recensioni' && Array.isArray(section.data) ? (section.data as Review[]) : [];
  }

  textData(section: ClinicalFolderSection): string {
    return typeof section.data === 'string' && section.data.trim() ? section.data : this.transloco.translate('folder.none');
  }

  personName(patient?: Patient) {
    return `${patient?.user?.firstName ?? patient?.firstName ?? ''} ${patient?.user?.lastName ?? patient?.lastName ?? ''}`.trim() || this.transloco.translate('folder.defaultPatient');
  }

  patientStructure(patient: Patient) {
    return typeof patient.structure === 'string' ? patient.structure : (patient.structure?.name ?? '—');
  }

  openReport(report: Report) {
    void this.router.navigate(['/app/reports', report.id]);
  }

  icon(key: string) {
    return (
      (
        {
          anagrafica: 'pi pi-id-card',
          anamnesi: 'pi pi-heart',
          allergie: 'pi pi-exclamation-circle',
          appuntamenti: 'pi pi-calendar',
          referti: 'pi pi-file',
          recensioni: 'pi pi-star',
        } as Record<string, string>
      )[key] ?? 'pi pi-folder'
    );
  }
}
