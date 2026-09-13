import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../core/api/api.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { Doctor, Specialization, Structure } from '../../core/models';

@Component({
  imports: [FormsModule, AvatarModule, ButtonModule, CardModule, MessageModule, SelectModule, SkeletonModule, TranslocoModule],
  templateUrl: './authenticated-booking-page.component.html',
  styleUrl: './authenticated-booking-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedBookingPageComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly structures = signal<Structure[]>([]);
  readonly specializations = signal<Specialization[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  structureId?: string;
  specializationId?: string;

  constructor() {
    this.structureId = this.patientStructureId();
    this.api.structures().subscribe({ next: (data) => this.structures.set(data), error: () => undefined });
    this.loadSpecializations();
    this.loadDoctors();
  }

  onStructureChange() {
    this.specializationId = undefined;
    this.loadSpecializations();
    this.loadDoctors();
  }

  loadSpecializations() {
    this.api.specializations(this.structureId).subscribe({ next: (data) => this.specializations.set(data), error: () => undefined });
  }

  loadDoctors() {
    this.loading.set(true);
    this.error.set('');
    this.api.doctors({ structureId: this.structureId, specializationId: this.specializationId }).subscribe({
      next: (data) => {
        this.doctors.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  resetFilters() {
    this.structureId = this.patientStructureId();
    this.specializationId = undefined;
    this.loadSpecializations();
    this.loadDoctors();
  }

  book(doctor: Doctor) {
    void this.router.navigate(['/app/booking', doctor.id]);
  }

  initials(doctor: Doctor) {
    return `${doctor.user.firstName?.[0] ?? ''}${doctor.user.lastName?.[0] ?? ''}`.toUpperCase();
  }

  private patientStructureId() {
    const structure = this.auth.user()?.patient?.structure;
    return typeof structure === 'string' ? structure : structure?.id;
  }
}
