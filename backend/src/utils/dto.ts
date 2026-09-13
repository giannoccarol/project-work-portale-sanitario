import { Appointment } from '../entities/Appointment';
import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';
import { Report } from '../entities/Report';
import { Review } from '../entities/Review';
import { User } from '../entities/User';

export function toPublicUser(user: User, includeEmail = true) {
  return {
    id: user.id,
    ...(includeEmail ? { email: user.email } : {}),
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export const toUserDto = toPublicUser;

export function toPatientDto(patient: Patient, includeClinicalData = false, includeIdentity = true) {
  return {
    id: patient.id,
    user: patient.user ? toPublicUser(patient.user) : undefined,
    structure: patient.structure
      ? {
          id: patient.structure.id,
          name: patient.structure.name,
          address: patient.structure.address,
          phone: patient.structure.phone,
        }
      : undefined,
    ...(includeIdentity ? { fiscalCode: patient.fiscalCode, birthDate: patient.birthDate } : {}),
    ...(includeClinicalData
      ? { anamnesi: patient.anamnesi, allergie: patient.allergie }
      : {}),
  };
}

export function toDoctorDto(doctor: Doctor, includeEmail = false) {
  return {
    id: doctor.id,
    user: doctor.user ? toPublicUser(doctor.user, includeEmail) : undefined,
    structure: doctor.structure
      ? {
          id: doctor.structure.id,
          name: doctor.structure.name,
          address: doctor.structure.address,
          phone: doctor.structure.phone,
          isActive: doctor.structure.isActive,
        }
      : undefined,
    specialization: doctor.specialization
      ? {
          id: doctor.specialization.id,
          name: doctor.specialization.name,
          description: doctor.specialization.description,
          isActive: doctor.specialization.isActive,
        }
      : undefined,
    bio: doctor.bio,
    isActive: doctor.isActive,
  };
}

export function toAppointmentDto(appointment: Appointment) {
  return {
    id: appointment.id,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    reason: appointment.reason,
    clinicalDataAccessGranted: appointment.clinicalDataAccessGranted,
    patient: appointment.patient ? toPatientDto(appointment.patient, false, false) : undefined,
    doctor: appointment.doctor ? toDoctorDto(appointment.doctor) : undefined,
    structure: appointment.structure
      ? { id: appointment.structure.id, name: appointment.structure.name }
      : undefined,
  };
}

export function toReportDto(report: Report) {
  return {
    id: report.id,
    appointment: report.appointment
      ? {
          id: report.appointment.id,
          startTime: report.appointment.startTime,
          endTime: report.appointment.endTime,
          status: report.appointment.status,
        }
      : undefined,
    patient: report.patient ? toPatientDto(report.patient, false, false) : undefined,
    doctor: report.doctor ? toDoctorDto(report.doctor) : undefined,
    diagnosis: report.diagnosis,
    prescriptions: report.prescriptions,
    notes: report.notes,
    status: report.status,
    hasAttachment: Boolean(report.attachmentPath),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

export function toReviewDto(review: Review) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    appointmentId: review.appointment?.id,
    doctor: review.doctor ? toDoctorDto(review.doctor) : undefined,
  };
}
