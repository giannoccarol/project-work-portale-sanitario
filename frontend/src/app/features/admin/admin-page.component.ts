import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/api/api.service';
import { Doctor, Specialization, Structure } from '../../core/models';
import { apiErrorMessage } from '../../core/api/api-error';

@Component({
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    TableModule,
    TabsModule,
    TagModule,
    TranslocoModule,
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent {
  private readonly api = inject(ApiService);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  readonly structures = signal<Structure[]>([]);
  readonly specializations = signal<Specialization[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly dialogType = signal<'structure' | 'specialization' | 'doctor'>('structure');
  readonly saving = signal(false);
  dialogOpen = false;
  structureDraft = { name: '', address: '', phone: '' };
  specializationDraft = { name: '', description: '', structureId: '' };

  doctorDraft = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    structureId: '',
    specializationId: '',
    bio: '',
  };

  constructor() {
    this.reload();
  }

  reload() {
    this.api.structures(true).subscribe((d) => this.structures.set(d));
    this.api.specializations(undefined, true).subscribe((d) => this.specializations.set(d));
    this.api.doctors({}, true).subscribe((d) => this.doctors.set(d));
  }

  activeDoctors() {
    return this.doctors().filter((d) => d.isActive).length;
  }

  activeStructures() {
    return this.structures().filter((s) => s.isActive);
  }

  doctorSpecializations() {
    return this.specializations().filter((s) => s.isActive && s.structure?.id === this.doctorDraft.structureId);
  }

  dialogTitle() {
    return { structure: 'admin.dialogStructure', specialization: 'admin.dialogSpecialization', doctor: 'admin.dialogDoctor' }[
      this.dialogType()
    ];
  }

  openDialog(type: 'structure' | 'specialization' | 'doctor') {
    this.dialogType.set(type);
    this.structureDraft = { name: '', address: '', phone: '' };
    this.specializationDraft = { name: '', description: '', structureId: '' };
    this.doctorDraft = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      structureId: '',
      specializationId: '',
      bio: '',
    };
    this.dialogOpen = true;
  }

  save() {
    this.saving.set(true);
    const type = this.dialogType();
    const request: Observable<unknown> =
      type === 'structure'
        ? this.api.createStructure(this.structureDraft)
        : type === 'specialization'
          ? this.api.createSpecialization(this.specializationDraft)
          : this.api.createDoctor(this.doctorDraft);
    request.subscribe({
      next: () => {
        this.dialogOpen = false;
        this.saving.set(false);
        this.reload();
        this.messages.add({ severity: 'success', summary: this.transloco.translate('admin.createdToast') });
      },
      error: (e: unknown) => {
        this.saving.set(false);
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('admin.saveSummary'),
          detail: apiErrorMessage(e),
        });
      },
    });
  }

  toggleStructure(item: Structure) {
    this.api.setStructureStatus(item.id, !item.isActive).subscribe({
      next: (u) => this.structures.update((v) => v.map((x) => (x.id === u.id ? u : x))),
      error: (e) => this.fail(e),
    });
  }

  toggleSpecialization(item: Specialization) {
    this.api.setSpecializationStatus(item.id, !item.isActive).subscribe({
      next: (u) => this.specializations.update((v) => v.map((x) => (x.id === u.id ? u : x))),
      error: (e) => this.fail(e),
    });
  }

  toggleDoctor(item: Doctor) {
    this.api.setDoctorStatus(item.id, !item.isActive).subscribe({
      next: (u) => this.doctors.update((v) => v.map((x) => (x.id === u.id ? u : x))),
      error: (e) => this.fail(e),
    });
  }

  fail(e: unknown) {
    this.messages.add({
      severity: 'error',
      summary: this.transloco.translate('admin.updateSummary'),
      detail: apiErrorMessage(e),
    });
  }
}
