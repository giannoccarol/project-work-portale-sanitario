import { AppDataSource } from '../../config/data-source';
import { Patient } from '../../entities/Patient';
import { Appointment } from '../../entities/Appointment';
import { Report } from '../../entities/Report';
import { Review } from '../../entities/Review';
import { Errors } from '../../utils/errors';
import { toAppointmentDto, toReportDto, toReviewDto } from '../../utils/dto';

export type SectionAccess = 'standard' | 'patient-consent';

export interface FolderSection {
  key: string;
  access: SectionAccess;
  locked: boolean;
  data: unknown;
}

export interface ClinicalFolder {
  patient: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    fiscalCode?: string;
    birthDate?: string;
    structure?: string;
  };
  sections: FolderSection[];
}

export interface Viewer {
  role: string;
  userId: string;
  appointmentId?: string;
}

export class PatientService {
  private repo = () => AppDataSource.getRepository(Patient);

  async getByUser(userId: string): Promise<Patient> {
    const p = await this.repo().findOne({
      where: { user: { id: userId } },
      relations: ['user', 'structure'],
    });
    if (!p) throw Errors.notFound('Paziente non trovato');
    return p;
  }

  async getById(id: string): Promise<Patient> {
    const p = await this.repo().findOne({ where: { id }, relations: ['user', 'structure'] });
    if (!p) throw Errors.notFound('Paziente non trovato');
    return p;
  }

  private patientView(p: Patient) {
    return {
      id: p.id,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      email: p.user.email,
      fiscalCode: p.fiscalCode,
      birthDate: p.birthDate,
      structure: p.structure?.name,
    };
  }

  private patientMinimumView(p: Patient) {
    return {
      id: p.id,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      structure: p.structure?.name,
    };
  }

  async buildFolder(patientId: string, viewer: Viewer): Promise<ClinicalFolder> {
    const patient = await this.getById(patientId);
    const isOwner = viewer.role === 'patient' && patient.user.id === viewer.userId;
    if (viewer.role === 'patient' && !isOwner)
      throw Errors.forbidden('Non puoi consultare la cartella di un altro paziente');
    if (!['patient', 'doctor', 'admin'].includes(viewer.role)) throw Errors.forbidden();

    let context: Appointment | null = null;
    let canSeeRestricted = isOwner;

    if (viewer.role === 'doctor') {
      if (!viewer.appointmentId)
        throw Errors.badRequest('appointmentId obbligatorio per il medico', 'APPOINTMENT_CONTEXT_REQUIRED');
      context = await AppDataSource.getRepository(Appointment).findOne({
        where: { id: viewer.appointmentId },
        relations: ['doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'patient', 'patient.user', 'patient.structure', 'structure'],
      });
      if (!context || context.patient.id !== patientId || context.doctor.user.id !== viewer.userId)
        throw Errors.forbidden('La visita non autorizza l accesso a questa cartella', 'APPOINTMENT_CONTEXT_INVALID');
      canSeeRestricted = context.status === 'booked' && context.clinicalDataAccessGranted;
    }

    const allAppointments = viewer.role === 'doctor'
      ? []
      : await AppDataSource.getRepository(Appointment).find({
          where: { patient: { id: patientId } },
          relations: ['doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'structure'],
          order: { startTime: 'DESC' },
        });
    const appointments = context ? [context] : allAppointments;

    const reports = viewer.role === 'admin'
      ? []
      : await AppDataSource.getRepository(Report).find({
      where: { patient: { id: patientId } },
      relations: ['doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'appointment'],
      order: { createdAt: 'DESC' },
    });
    const publishedReports = reports.filter((report) => report.status === 'published');
    const reviews = isOwner
      ? await AppDataSource.getRepository(Review).find({
          where: { patient: { id: patientId } },
          relations: ['doctor', 'doctor.user', 'doctor.specialization', 'doctor.structure', 'appointment'],
          order: { createdAt: 'DESC' },
        })
      : [];

    const visiblePatient = viewer.role === 'doctor' ? this.patientMinimumView(patient) : this.patientView(patient);

    const mk = (key: string, access: SectionAccess, data: unknown): FolderSection => {
      const locked = access === 'patient-consent' && !canSeeRestricted;
      return { key, access, locked, data: locked ? null : data };
    };

    const sections: FolderSection[] = [
      mk('anagrafica', 'standard', visiblePatient),
      mk('appuntamenti', 'standard', appointments.map(toAppointmentDto)),
      mk('referti', 'patient-consent', publishedReports.map(toReportDto)),
      mk('recensioni', 'standard', reviews.map(toReviewDto)),
      mk('anamnesi', 'patient-consent', patient.anamnesi ?? null),
      mk('allergie', 'patient-consent', patient.allergie ?? null),
    ];

    return { patient: visiblePatient, sections };
  }
}
