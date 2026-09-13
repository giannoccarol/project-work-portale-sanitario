import { Injectable, signal } from '@angular/core';

export interface BookingDraft {
  doctorId: string;
  date: Date;
  startTime: string;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class BookingDraftService {
  private readonly state = signal<BookingDraft | null>(null);
  readonly draft = this.state.asReadonly();

  save(draft: BookingDraft) {
    this.state.set(draft);
  }

  clear() {
    this.state.set(null);
  }
}
