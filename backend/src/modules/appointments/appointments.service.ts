import { AppDataSource } from '../../config/data-source';
import { Appointment } from '../../entities/Appointment';
import { Patient } from '../../entities/Patient';
import { Doctor } from '../../entities/Doctor';
import { QueryFailedError } from 'typeorm';
import { slotsOverlap } from '../../utils/validators';
import { Errors } from '../../utils/errors';
import { dateInAppTimeZone, isAbsoluteIsoDateTime, isValidCalendarDate, zonedDateTimeToUtc } from '../../utils/time';
import { Page, PageRequest, pageWindow, toPage } from '../../utils/pagination';

export interface BookDto {
  doctorId: string;
  startTime: string;
  reason?: string;
}

const SLOT_MINUTES = 30;
// Fasce fisse per tutti i medici (niente calendari individuali).
const WORK_BLOCKS: Array<[string, string]> = [
  ['09:00', '13:00'],
  ['14:00', '18:00'],
];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export class AppointmentService {
  private repo = () => AppDataSource.getRepository(Appointment);

  private async patientByUser(userId: string): Promise<Patient> {
    const p = await AppDataSource.getRepository(Patient).findOne({
      where: { user: { id: userId } },
      relations: ['user', 'structure'],
    });
    if (!p) throw Errors.badRequest('Profilo paziente non trovato');
    return p;
  }

  async listForPatient(userId: string, page: PageRequest): Promise<Page<Appointment>> {
    const patient = await this.patientByUser(userId);
    return toPage(await this.repo().findAndCount({
      where: { patient: { id: patient.id } },
      relations: ['doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'structure'],
      order: { startTime: 'ASC' },
      ...pageWindow(page),
    }), page);
  }

  async listForDoctor(doctorUserId: string, page: PageRequest): Promise<Page<Appointment>> {
    const doctor = await AppDataSource.getRepository(Doctor).findOne({
      where: { user: { id: doctorUserId } },
    });
    if (!doctor) throw Errors.badRequest('Profilo medico non trovato');
    return toPage(await this.repo().findAndCount({
      where: { doctor: { id: doctor.id } },
      relations: ['patient', 'patient.user', 'patient.structure', 'structure'],
      order: { startTime: 'ASC' },
      ...pageWindow(page),
    }), page);
  }

  async listAll(page: PageRequest): Promise<Page<Appointment>> {
    return toPage(await this.repo().findAndCount({
      relations: ['patient', 'patient.user', 'patient.structure', 'doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'structure'],
      order: { startTime: 'ASC' },
      ...pageWindow(page),
    }), page);
  }

  /** Genera gli slot disponibili per un medico in una data (yyyy-mm-dd). */
  async availableSlots(doctorId: string, date: string): Promise<string[]> {
    const doctor = await AppDataSource.getRepository(Doctor).findOne({
      where: { id: doctorId, isActive: true },
      relations: ['structure', 'specialization', 'specialization.structure'],
    });
    if (!doctor) throw Errors.notFound('Medico non trovato', 'DOCTOR_NOT_FOUND');
    if (!doctor.structure.isActive || !doctor.specialization?.isActive)
      throw Errors.conflict('Il medico non e disponibile per nuove prenotazioni', 'DOCTOR_NOT_AVAILABLE');
    if (doctor.specialization.structure.id !== doctor.structure.id)
      throw Errors.conflict('Configurazione medico non coerente con la struttura', 'DOCTOR_STRUCTURE_INVALID');
    if (!isValidCalendarDate(date))
      throw Errors.badRequest('Data non valida (usa yyyy-mm-dd)', 'DATE_INVALID');

    const booked = await this.repo().find({
      where: { doctor: { id: doctorId }, status: 'booked' },
    });

    const slots: string[] = [];
    for (const [start, end] of WORK_BLOCKS) {
      const blockStart = timeToMinutes(start);
      const blockEnd = timeToMinutes(end);
      for (let m = blockStart; m + SLOT_MINUTES <= blockEnd; m += SLOT_MINUTES) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        const slotStart = zonedDateTimeToUtc(date, `${hh}:${mm}`);
        if (!slotStart) continue;
        const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60000);
        if (slotStart.getTime() <= Date.now()) continue;
        const conflict = booked.some((b) =>
          slotsOverlap(
            { startTime: slotStart, endTime: slotEnd },
            { startTime: b.startTime, endTime: b.endTime },
          ),
        );
        if (!conflict) slots.push(slotStart.toISOString());
      }
    }
    return slots;
  }

  async book(patientUserId: string, dto: BookDto): Promise<Appointment> {
    if (!isAbsoluteIsoDateTime(dto.startTime))
      throw Errors.badRequest('Lo slot deve includere il fuso orario', 'SLOT_TIMEZONE_REQUIRED');
    const slotStart = new Date(dto.startTime);
    const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60000);
    if (Number.isNaN(slotStart.getTime()) || slotStart.getTime() <= Date.now())
      throw Errors.badRequest('Lo slot deve essere una data futura valida', 'SLOT_INVALID');
    const patient = await this.patientByUser(patientUserId);
    const doctor = await AppDataSource.getRepository(Doctor).findOne({
      where: { id: dto.doctorId, isActive: true },
      relations: ['structure', 'specialization', 'specialization.structure'],
    });
    if (!doctor) throw Errors.notFound('Medico non trovato', 'DOCTOR_NOT_FOUND');
    if (!patient.structure.isActive)
      throw Errors.conflict('La struttura del paziente non e attiva', 'PATIENT_STRUCTURE_INACTIVE');
    if (!doctor.structure.isActive || !doctor.specialization?.isActive)
      throw Errors.conflict('Il medico non e disponibile per nuove prenotazioni', 'DOCTOR_NOT_AVAILABLE');
    if (doctor.specialization.structure.id !== doctor.structure.id)
      throw Errors.conflict('Configurazione medico non coerente con la struttura', 'DOCTOR_STRUCTURE_INVALID');
    if (patient.structure.id !== doctor.structure.id)
      throw Errors.forbidden('Paziente e medico devono appartenere alla stessa struttura', 'TENANT_MISMATCH');

    const date = dateInAppTimeZone(slotStart);
    const available = await this.availableSlots(doctor.id, date);
    if (!available.some((slot) => new Date(slot).getTime() === slotStart.getTime()))
      throw Errors.conflict('Lo slot selezionato non e disponibile', 'SLOT_UNAVAILABLE');

    // controllo sovrapposizione con gli appuntamenti gia prenotati del medico
    const appt = new Appointment();
    appt.patient = patient;
    appt.doctor = doctor;
    appt.structure = doctor.structure;
    appt.startTime = slotStart;
    appt.endTime = slotEnd;
    appt.status = 'booked';
    appt.reason = dto.reason;
    appt.clinicalDataAccessGranted = false;
    try {
      return await this.repo().save(appt);
    } catch (error) {
      if (error instanceof QueryFailedError && String(error.message).includes('UNIQUE constraint failed'))
        throw Errors.conflict('Lo slot selezionato non e piu disponibile', 'SLOT_UNAVAILABLE');
      throw error;
    }
  }

  async cancel(appointmentId: string, userId: string, role: string): Promise<Appointment> {
    const appt = await this.repo().findOne({
      where: { id: appointmentId },
      relations: ['patient', 'patient.user', 'patient.structure', 'doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'structure'],
    });
    if (!appt) throw Errors.notFound('Appuntamento non trovato');
    if (role !== 'patient' && role !== 'doctor') throw Errors.forbidden();
    if (role === 'patient' && appt.patient.user.id !== userId)
      throw Errors.forbidden('Non puoi annullare questa prenotazione');
    if (role === 'doctor' && appt.doctor.user.id !== userId)
      throw Errors.forbidden('Non puoi annullare questa prenotazione');
    if (appt.status !== 'booked')
      throw Errors.conflict('Solo gli appuntamenti prenotati possono essere annullati', 'APPOINTMENT_NOT_BOOKED');
    appt.status = 'cancelled';
    appt.clinicalDataAccessGranted = false;
    return this.repo().save(appt);
  }

  async setClinicalAccess(appointmentId: string, patientUserId: string, granted: boolean): Promise<Appointment> {
    const appt = await this.repo().findOne({
      where: { id: appointmentId },
      relations: ['patient', 'patient.user', 'patient.structure', 'doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'structure'],
    });
    if (!appt) throw Errors.notFound('Appuntamento non trovato');
    if (appt.patient.user.id !== patientUserId)
      throw Errors.forbidden('Non puoi modificare il consenso per questa visita', 'CONSENT_FORBIDDEN');
    if (appt.status !== 'booked')
      throw Errors.conflict('Il consenso puo essere modificato solo per visite prenotate', 'CONSENT_NOT_AVAILABLE');
    appt.clinicalDataAccessGranted = granted;
    return this.repo().save(appt);
  }

  async get(appointmentId: string, userId: string, role: string): Promise<Appointment> {
    const appt = await this.repo().findOne({
      where: { id: appointmentId },
      relations: ['patient', 'patient.user', 'patient.structure', 'doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'structure'],
    });
    if (!appt) throw Errors.notFound('Appuntamento non trovato');
    if (role === 'patient' && appt.patient.user.id !== userId) throw Errors.forbidden();
    if (role === 'doctor' && appt.doctor.user.id !== userId) throw Errors.forbidden();
    return appt;
  }
}
