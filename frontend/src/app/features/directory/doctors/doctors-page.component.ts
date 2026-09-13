import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { AvatarModule } from 'primeng/avatar';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Doctor, Specialization, Structure } from '../../../core/models';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({
  imports: [FormsModule, ButtonModule, AvatarModule, CardModule, SelectModule, SkeletonModule, TranslocoModule],
  templateUrl: './doctors-page.component.html',
  styleUrl: './doctors-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorsPageComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly structures = signal<Structure[]>([]);
  readonly specializations = signal<Specialization[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  structureId?: string;
  specializationId?: string;

  constructor() {
    this.api.structures().subscribe({ next: (data) => this.structures.set(data), error: () => undefined });
    this.api.specializations().subscribe({ next: (data) => this.specializations.set(data), error: () => undefined });
    this.loadDoctors();
  }

  onStructureChange() {
    this.specializationId = undefined;
    this.api.specializations(this.structureId).subscribe((data) => this.specializations.set(data));
    this.loadDoctors();
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
    this.structureId = undefined;
    this.specializationId = undefined;
    this.api.specializations().subscribe((data) => this.specializations.set(data));
    this.loadDoctors();
  }

  initials(doctor: Doctor) {
    return `${doctor.user.firstName?.[0] ?? ''}${doctor.user.lastName?.[0] ?? ''}`.toUpperCase();
  }

  go(url: string) {
    void this.router.navigateByUrl(url);
  }

  book(doctor: Doctor) {
    void this.router.navigateByUrl(this.auth.authenticated() ? `/app/booking/${doctor.id}` : `/booking/${doctor.id}`);
  }
}
