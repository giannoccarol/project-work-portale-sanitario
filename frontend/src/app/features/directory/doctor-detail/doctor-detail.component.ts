import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Doctor, DoctorReviews } from '../../../core/models';

@Component({
  imports: [DecimalPipe, RouterLink, ButtonModule, AvatarModule, RatingModule, FormsModule, TranslocoModule],
  templateUrl: './doctor-detail.component.html',
  styleUrl: './doctor-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorDetailComponent {
  readonly id = input.required<string>();
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly doctor = signal<Doctor | null>(null);
  readonly reviews = signal<DoctorReviews | null>(null);
  readonly loading = signal(true);

  constructor() {
    queueMicrotask(() => {
      this.api.doctor(this.id()).subscribe({
        next: (doctor) => {
          this.doctor.set(doctor);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      this.api
        .doctorReviews(this.id())
        .subscribe({ next: (reviews) => this.reviews.set(reviews), error: () => undefined });
    });
  }

  initials() {
    const doctor = this.doctor();
    return `${doctor?.user.firstName?.[0] ?? ''}${doctor?.user.lastName?.[0] ?? ''}`.toUpperCase();
  }

  book() {
    void this.router.navigate([this.auth.authenticated() ? '/app/booking' : '/booking', this.id()]);
  }
}
