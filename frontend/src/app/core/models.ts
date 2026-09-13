export type UserRole = 'patient' | 'doctor' | 'admin';
export type AppointmentStatus = 'booked' | 'completed' | 'cancelled';
export type ReportStatus = 'draft' | 'published';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface Structure {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isActive?: boolean;
}

export interface Specialization {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  structure?: Structure;
}

export interface Patient {
  id: string;
  user?: User;
  firstName?: string;
  lastName?: string;
  email?: string;
  structure?: Structure | string;
  fiscalCode?: string;
  birthDate?: string;
  anamnesi?: string;
  allergie?: string;
}

export interface Doctor {
  id: string;
  user: User;
  structure: Structure;
  specialization: Specialization;
  bio?: string;
  isActive?: boolean;
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason?: string;
  clinicalDataAccessGranted: boolean;
  patient: Patient;
  doctor: Doctor;
  structure: Pick<Structure, 'id' | 'name'>;
}

export interface Report {
  id: string;
  appointment: Pick<Appointment, 'id' | 'startTime' | 'endTime' | 'status'>;
  patient: Patient;
  doctor: Doctor;
  diagnosis?: string;
  prescriptions?: string;
  notes?: string;
  status: ReportStatus;
  hasAttachment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  appointmentId?: string;
  doctor?: Doctor;
  patient?: { firstName: string; lastInitial: string };
}

export interface DoctorReviews {
  doctorId: string;
  count: number;
  average: number;
  reviews: Review[];
}

export interface ClinicalFolderSection {
  key: string;
  access: 'standard' | 'patient-consent';
  locked: boolean;
  data: unknown;
}

export type FolderPatientData = Patient;
export type FolderAppointmentData = Appointment[];
export type FolderReportData = Report[];
export type FolderReviewData = Review[];

export interface ClinicalFolder {
  patient: Patient;
  sections: ClinicalFolderSection[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
export interface ApiError {
  code?: string;
  error: string;
}
export type AvailableSlot = string;

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
