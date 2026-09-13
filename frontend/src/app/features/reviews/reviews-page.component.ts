import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { TextareaModule } from 'primeng/textarea';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/api/api.service';
import { Appointment, Review } from '../../core/models';
import { apiErrorMessage } from '../../core/api/api-error';
import { injectLocale } from '../../core/i18n/locale';

@Component({
  imports: [DatePipe, FormsModule, ButtonModule, CardModule, DialogModule, RatingModule, TextareaModule, AvatarModule, TranslocoModule],
  templateUrl: './reviews-page.component.html',
  styleUrl: './reviews-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsPageComponent {
  private readonly api = inject(ApiService);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  readonly locale = injectLocale();
  readonly reviews = signal<Review[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly selected = signal<Appointment | null>(null);
  readonly checkingId = signal<string | null>(null);
  readonly saving = signal(false);
  dialogOpen = false;
  rating = 0;
  comment = '';

  readonly reviewable = computed(() =>
    this.appointments().filter(
      (a) => a.status === 'completed' && !this.reviews().some((r) => r.appointmentId === a.id),
    ),
  );

  constructor() {
    forkJoin({ reviews: this.api.myReviews(), appointments: this.api.appointments() }).subscribe({
      next: (r) => {
        this.reviews.set(r.reviews);
        this.appointments.set(r.appointments);
      },
      error: (e) =>
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('reviews.summaryToast'),
          detail: apiErrorMessage(e),
        }),
    });
  }

  open(a: Appointment) {
    this.checkingId.set(a.id);
    this.api.appointmentReview(a.id).subscribe({
      next: (existing) => {
        this.checkingId.set(null);
        if (existing) {
          this.reviews.update((items) => (items.some((item) => item.id === existing.id) ? items : [existing, ...items]));
          this.messages.add({
            severity: 'info',
            summary: this.transloco.translate('reviews.alreadyReviewedToast'),
          });
          return;
        }
        this.selected.set(a);
        this.rating = 0;
        this.comment = '';
        this.dialogOpen = true;
      },
      error: (e) => {
        this.checkingId.set(null);
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('reviews.checkErrorToast'),
          detail: apiErrorMessage(e),
        });
      },
    });
  }

  save() {
    const a = this.selected();
    if (!a || !this.rating) return;
    this.saving.set(true);
    this.api
      .createReview({ appointmentId: a.id, rating: this.rating, comment: this.comment.trim() || undefined })
      .subscribe({
        next: (r) => {
          this.reviews.update((v) => [r, ...v]);
          this.dialogOpen = false;
          this.saving.set(false);
          this.messages.add({ severity: 'success', summary: this.transloco.translate('reviews.publishedToast') });
        },
        error: (e) => {
          this.saving.set(false);
          this.messages.add({
            severity: 'error',
            summary: this.transloco.translate('reviews.errorToast'),
            detail: apiErrorMessage(e),
          });
        },
      });
  }

  initials(a: Appointment) {
    return `${a.doctor.user.firstName?.[0] ?? ''}${a.doctor.user.lastName?.[0] ?? ''}`.toUpperCase();
  }

  reviewInitials(r: Review) {
    return `${r.doctor?.user.firstName?.[0] ?? ''}${r.doctor?.user.lastName?.[0] ?? ''}`.toUpperCase();
  }
}
