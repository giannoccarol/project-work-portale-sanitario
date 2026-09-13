import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  Appointment,
  AvailableSlot,
  ClinicalFolder,
  Doctor,
  DoctorReviews,
  Report,
  Review,
  Page,
  Specialization,
  Structure,
  User,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  private pagination(params = new HttpParams()) {
    return params.set('page', 1).set('pageSize', 100);
  }

  private items<T>() {
    return map((response: Page<T>) => response.items);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`);
  }

  changePassword(body: { currentPassword: string; newPassword: string }) {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/auth/me/password`, body);
  }

  structures(all = false) {
    return this.http
      .get<Page<Structure>>(`${this.baseUrl}/structures${all ? '/all' : ''}`, { params: this.pagination() })
      .pipe(this.items<Structure>());
  }

  specializations(structureId?: string, all = false) {
    let params = new HttpParams();
    if (structureId) params = params.set('structureId', structureId);
    return this.http
      .get<Page<Specialization>>(`${this.baseUrl}/specializations${all ? '/all' : ''}`, {
        params: this.pagination(params),
      })
      .pipe(this.items<Specialization>());
  }

  doctors(filters: { structureId?: string; specializationId?: string } = {}, all = false) {
    let params = new HttpParams();
    if (filters.structureId) params = params.set('structureId', filters.structureId);
    if (filters.specializationId) params = params.set('specializationId', filters.specializationId);
    return this.http
      .get<Page<Doctor>>(`${this.baseUrl}/doctors${all ? '/all' : ''}`, { params: this.pagination(params) })
      .pipe(this.items<Doctor>());
  }

  doctor(id: string) {
    return this.http.get<Doctor>(`${this.baseUrl}/doctors/${id}`);
  }

  availableSlots(doctorId: string, date: string) {
    return this.http.get<AvailableSlot[]>(`${this.baseUrl}/appointments/available/${doctorId}`, {
      params: { date },
    });
  }

  doctorReviews(doctorId: string) {
    return this.http.get<DoctorReviews>(`${this.baseUrl}/reviews/doctor/${doctorId}`);
  }

  appointments(all = false) {
    return this.http
      .get<Page<Appointment>>(`${this.baseUrl}/appointments${all ? '/all' : ''}`, { params: this.pagination() })
      .pipe(this.items<Appointment>());
  }

  bookAppointment(body: { doctorId: string; startTime: string; reason?: string }) {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, body);
  }

  cancelAppointment(id: string) {
    return this.http.delete<Appointment>(`${this.baseUrl}/appointments/${id}`);
  }

  setClinicalAccess(id: string, granted: boolean) {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/clinical-access`, { granted });
  }

  appointment(id: string) {
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}`);
  }

  myFolder() {
    return this.http.get<ClinicalFolder>(`${this.baseUrl}/patients/me/folder`);
  }

  patientFolder(patientId: string, appointmentId?: string) {
    return this.http.get<ClinicalFolder>(`${this.baseUrl}/patients/${patientId}/folder`, {
      params: appointmentId ? { appointmentId } : {},
    });
  }

  reports(all = false) {
    return this.http
      .get<Page<Report>>(`${this.baseUrl}/reports${all ? '/all' : ''}`, { params: this.pagination() })
      .pipe(this.items<Report>());
  }

  report(id: string) {
    return this.http.get<Report>(`${this.baseUrl}/reports/${id}`);
  }

  updateReport(id: string, form: FormData) {
    return this.http.put<Report>(`${this.baseUrl}/reports/${id}`, form);
  }

  publishReport(id: string) {
    return this.http.post<Report>(`${this.baseUrl}/reports/${id}/publish`, {});
  }

  createReport(appointmentId: string, form: FormData) {
    return this.http.post<Report>(`${this.baseUrl}/reports/${appointmentId}`, form);
  }

  downloadReport(id: string) {
    return this.http.get(`${this.baseUrl}/reports/${id}/download`, { observe: 'response', responseType: 'blob' });
  }

  myReviews() {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/me`);
  }

  appointmentReview(appointmentId: string) {
    return this.http.get<Review | null>(`${this.baseUrl}/reviews/appointment/${appointmentId}`);
  }

  createReview(body: { appointmentId: string; rating: number; comment?: string }) {
    return this.http.post<Review>(`${this.baseUrl}/reviews`, body);
  }

  createStructure(body: Partial<Structure>) {
    return this.http.post<Structure>(`${this.baseUrl}/structures`, body);
  }

  updateStructure(id: string, body: Partial<Structure>) {
    return this.http.put<Structure>(`${this.baseUrl}/structures/${id}`, body);
  }

  setStructureStatus(id: string, isActive: boolean) {
    return this.http.patch<Structure>(`${this.baseUrl}/structures/${id}/status`, { isActive });
  }

  createSpecialization(body: Partial<Specialization>) {
    return this.http.post<Specialization>(`${this.baseUrl}/specializations`, body);
  }

  setSpecializationStatus(id: string, isActive: boolean) {
    return this.http.patch<Specialization>(`${this.baseUrl}/specializations/${id}/status`, { isActive });
  }

  createDoctor(body: Record<string, unknown>) {
    return this.http.post<Doctor>(`${this.baseUrl}/doctors`, body);
  }

  setDoctorStatus(id: string, isActive: boolean) {
    return this.http.patch<Doctor>(`${this.baseUrl}/doctors/${id}/status`, { isActive });
  }
}
