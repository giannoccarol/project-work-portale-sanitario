import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../../config/data-source';
import { Report } from '../../entities/Report';
import { Appointment } from '../../entities/Appointment';
import { Patient } from '../../entities/Patient';
import { Doctor } from '../../entities/Doctor';
import { config } from '../../config/env';
import { Errors } from '../../utils/errors';
import { dateInAppTimeZone } from '../../utils/time';
import { Page, PageRequest, pageWindow, toPage } from '../../utils/pagination';

export interface ReportDto {
  diagnosis: string;
  prescriptions?: string;
  notes?: string;
}

async function ensureUploadsDir(): Promise<string> {
  const dir = path.resolve(config.uploadsDir);
  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
}

function validatePdf(file?: Express.Multer.File): void {
  if (!file) return;
  const validMetadata = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
  const hasHeader = file.buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  const hasTrailer = file.buffer.subarray(Math.max(0, file.buffer.length - 2048)).includes(Buffer.from('%%EOF'));
  if (!validMetadata || !hasHeader || !hasTrailer)
    throw Errors.badRequest('L allegato non contiene un PDF valido', 'ATTACHMENT_NOT_PDF');
}

async function storePdf(reportId: string, file: Express.Multer.File): Promise<string> {
  const dir = await ensureUploadsDir();
  const finalPath = path.join(dir, `${reportId}-${randomUUID()}.pdf`);
  const temporaryPath = `${finalPath}.tmp`;
  try {
    await fs.promises.writeFile(temporaryPath, file.buffer, { flag: 'wx' });
    await fs.promises.rename(temporaryPath, finalPath);
    return finalPath;
  } catch (error) {
    await fs.promises.unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function safeUnlink(filePath?: string): Promise<void> {
  if (filePath) await fs.promises.unlink(filePath).catch(() => undefined);
}

export class ReportService {
  private repo = () => AppDataSource.getRepository(Report);

  private async doctorByUser(doctorUserId: string): Promise<Doctor> {
    const d = await AppDataSource.getRepository(Doctor).findOne({ where: { user: { id: doctorUserId } } });
    if (!d) throw Errors.badRequest('Profilo medico non trovato');
    return d;
  }

  async create(doctorUserId: string, appointmentId: string, dto: ReportDto, file?: Express.Multer.File): Promise<Report> {
    if (!dto.diagnosis?.trim()) throw Errors.badRequest('La diagnosi e obbligatoria', 'DIAGNOSIS_REQUIRED');
    validatePdf(file);
    const doctor = await this.doctorByUser(doctorUserId);
    const appt = await AppDataSource.getRepository(Appointment).findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'patient', 'patient.user', 'patient.structure', 'structure'],
    });
    if (!appt) throw Errors.notFound('Appuntamento non trovato');
    if (appt.doctor.user.id !== doctorUserId) throw Errors.forbidden('Non autorizzato per questo appuntamento');
    if (appt.status !== 'booked')
      throw Errors.conflict('Il referto puo essere creato solo per una visita prenotata', 'APPOINTMENT_NOT_BOOKED');
    if (appt.startTime.getTime() > Date.now())
      throw Errors.conflict('Il referto puo essere creato solo dopo l inizio della visita', 'VISIT_NOT_STARTED');
    const existing = await this.repo().findOne({ where: { appointment: { id: appointmentId } } });
    if (existing) throw Errors.conflict('Esiste gia un referto per questo appuntamento');

    const report = new Report();
    report.appointment = appt;
    report.patient = appt.patient;
    report.doctor = appt.doctor;
    report.structure = appt.structure;
    report.diagnosis = dto.diagnosis.trim();
    report.prescriptions = dto.prescriptions;
    report.notes = dto.notes;
    report.status = 'draft';
    const saved = await this.repo().save(report);
    if (!file) return saved;
    let storedPath: string | undefined;
    try {
      storedPath = await storePdf(saved.id, file);
      saved.attachmentPath = storedPath;
      return await this.repo().save(saved);
    } catch (error) {
      await safeUnlink(storedPath);
      await this.repo().remove(saved).catch(() => undefined);
      throw error;
    }
  }

  async update(doctorUserId: string, reportId: string, dto: Partial<ReportDto>, file?: Express.Multer.File): Promise<Report> {
    validatePdf(file);
    const r = await this.getOwned(doctorUserId, reportId);
    if (r.status === 'published')
      throw Errors.conflict('Un referto pubblicato non puo essere modificato', 'REPORT_ALREADY_PUBLISHED');
    if (dto.diagnosis !== undefined) {
      if (!dto.diagnosis.trim()) throw Errors.badRequest('La diagnosi e obbligatoria', 'DIAGNOSIS_REQUIRED');
      r.diagnosis = dto.diagnosis.trim();
    }
    if (dto.prescriptions !== undefined) r.prescriptions = dto.prescriptions;
    if (dto.notes !== undefined) r.notes = dto.notes;
    if (!file) return this.repo().save(r);

    const previousPath = r.attachmentPath;
    const replacementPath = await storePdf(r.id, file);
    r.attachmentPath = replacementPath;
    try {
      const saved = await this.repo().save(r);
      await safeUnlink(previousPath);
      return saved;
    } catch (error) {
      await safeUnlink(replacementPath);
      r.attachmentPath = previousPath;
      throw error;
    }
  }

  async publish(doctorUserId: string, reportId: string): Promise<Report> {
    const r = await this.getOwned(doctorUserId, reportId);
    if (r.status === 'published')
      throw Errors.conflict('Il referto e gia pubblicato', 'REPORT_ALREADY_PUBLISHED');
    if (r.appointment.status !== 'booked')
      throw Errors.conflict('La visita non e piu prenotata', 'APPOINTMENT_NOT_BOOKED');
    if (r.appointment.startTime.getTime() > Date.now())
      throw Errors.conflict('Il referto puo essere pubblicato solo dopo l inizio della visita', 'VISIT_NOT_STARTED');
    await AppDataSource.transaction(async (manager) => {
      r.status = 'published';
      r.appointment.status = 'completed';
      r.appointment.clinicalDataAccessGranted = false;
      await manager.save(r.appointment);
      await manager.save(r);
    });
    return r;
  }

  private async getOwned(doctorUserId: string, reportId: string): Promise<Report> {
    const r = await this.repo().findOne({
      where: { id: reportId },
      relations: ['doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'patient', 'patient.user', 'patient.structure', 'appointment'],
    });
    if (!r) throw Errors.notFound('Referto non trovato');
    if (r.doctor.user.id !== doctorUserId) throw Errors.forbidden('Non autorizzato');
    return r;
  }

  async listForPatient(patientUserId: string, page: PageRequest): Promise<Page<Report>> {
    const patient = await AppDataSource.getRepository(Patient).findOne({ where: { user: { id: patientUserId } } });
    if (!patient) throw Errors.badRequest('Profilo paziente non trovato');
    return toPage(await this.repo().findAndCount({
      where: { patient: { id: patient.id }, status: 'published' },
      relations: ['doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'appointment'],
      order: { createdAt: 'DESC' },
      ...pageWindow(page),
    }), page);
  }

  async listForDoctor(doctorUserId: string, page: PageRequest): Promise<Page<Report>> {
    const doctor = await this.doctorByUser(doctorUserId);
    return toPage(await this.repo().findAndCount({
      where: { doctor: { id: doctor.id } },
      relations: ['patient', 'patient.user', 'patient.structure', 'appointment'],
      order: { createdAt: 'DESC' },
      ...pageWindow(page),
    }), page);
  }

  async listAll(page: PageRequest): Promise<Page<Report>> {
    return toPage(await this.repo().findAndCount({
      relations: ['patient', 'patient.user', 'patient.structure', 'doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'appointment'],
      order: { createdAt: 'DESC' },
      ...pageWindow(page),
    }), page);
  }

  async get(reportId: string, userId: string, role: string): Promise<Report> {
    const r = await this.repo().findOne({
      where: { id: reportId },
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user', 'appointment'],
    });
    if (!r) throw Errors.notFound('Referto non trovato');
    if (role === 'patient' && r.patient.user.id !== userId) throw Errors.forbidden();
    if (role === 'patient' && r.status !== 'published')
      throw Errors.notFound('Referto non trovato', 'REPORT_NOT_FOUND');
    if (role === 'doctor' && r.doctor.user.id !== userId) throw Errors.forbidden();
    return r;
  }

  async attachment(reportId: string, userId: string, role: string): Promise<{ filePath: string; downloadName: string }> {
    const r = await this.get(reportId, userId, role);
    if (!r.attachmentPath) throw Errors.notFound('Nessun allegato per questo referto');
    if (!fs.existsSync(r.attachmentPath)) throw Errors.notFound('File allegato non trovato su disco');
    const visitDate = dateInAppTimeZone(r.appointment.startTime);
    return { filePath: r.attachmentPath, downloadName: `referto-${visitDate}.pdf` };
  }
}
