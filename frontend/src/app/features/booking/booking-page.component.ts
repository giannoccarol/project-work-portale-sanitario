import { DatePipe } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { AvailableSlot, Doctor } from '../../core/models';
import { apiErrorMessage } from '../../core/api/api-error';
import { BookingDraftService } from './booking-draft.service';
import { injectLocale } from '../../core/i18n/locale';

@Component({
  imports: [DatePipe, FormsModule, RouterLink, ButtonModule, DatePickerModule, TextareaModule, AvatarModule, TranslocoModule],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingPageComponent {
  readonly doctorId = input.required<string>();
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  private readonly drafts = inject(BookingDraftService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  readonly locale = injectLocale();
  readonly doctor = signal<Doctor | null>(null);
  readonly slots = signal<AvailableSlot[]>([]);
  readonly selectedSlot = signal<AvailableSlot | null>(null);
  readonly slotsLoading = signal(false);
  readonly saving = signal(false);
  readonly minDate = new Date();
  readonly touchUI = signal(false);
  date: Date | null = null;
  reason = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const mq = window.matchMedia('(max-width: 780px)');
      this.touchUI.set(mq.matches);
      const onChange = (event: MediaQueryListEvent) => this.touchUI.set(event.matches);
      mq.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', onChange));
    });
    queueMicrotask(() => {
      this.api.doctor(this.doctorId()).subscribe((doctor) => this.doctor.set(doctor));
      const draft = this.drafts.draft();
      if (draft?.doctorId === this.doctorId()) {
        this.date = new Date(draft.date);
        this.reason = draft.reason;
        this.selectedSlot.set(draft.startTime);
        this.loadSlots(true);
      }
    });
  }

  loadSlots(preserveSelection = false) {
    if (!this.date) return;
    this.slotsLoading.set(true);
    if (!preserveSelection) this.selectedSlot.set(null);
    const date = [
      this.date.getFullYear(),
      String(this.date.getMonth() + 1).padStart(2, '0'),
      String(this.date.getDate()).padStart(2, '0'),
    ].join('-');
    this.api.availableSlots(this.doctorId(), date).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        if (this.selectedSlot() && !slots.includes(this.selectedSlot()!)) this.selectedSlot.set(null);
        this.slotsLoading.set(false);
      },
      error: (e) => {
        this.messages.add({
          severity: 'error',
          summary: this.transloco.translate('booking.slotsToast'),
          detail: apiErrorMessage(e),
        });
        this.slotsLoading.set(false);
      },
    });
  }

  confirm() {
    const slot = this.selectedSlot();
    if (!slot || !this.date) return;
    if (!this.auth.authenticated()) {
      this.drafts.save({ doctorId: this.doctorId(), date: this.date, startTime: slot, reason: this.reason });
      void this.router.navigate(['/login'], { queryParams: { returnUrl: `/booking/${this.doctorId()}` } });
      return;
    }
    this.saving.set(true);
    this.api
      .bookAppointment({ doctorId: this.doctorId(), startTime: slot, reason: this.reason.trim() || undefined })
      .subscribe({
        next: () => {
          this.drafts.clear();
          this.messages.add({
            severity: 'success',
            summary: this.transloco.translate('booking.confirmedToast'),
            detail: this.transloco.translate('booking.confirmedDetail'),
          });
          void this.router.navigateByUrl('/app/appointments');
        },
        error: (e) => {
          this.messages.add({
            severity: 'error',
            summary: this.transloco.translate('booking.failedToast'),
            detail: apiErrorMessage(e),
          });
          this.saving.set(false);
        },
      });
  }

  initials() {
    return `${this.doctor()?.user.firstName?.[0] ?? ''}${this.doctor()?.user.lastName?.[0] ?? ''}`.toUpperCase();
  }
}
