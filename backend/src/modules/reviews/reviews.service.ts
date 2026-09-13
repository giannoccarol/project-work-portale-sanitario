import { AppDataSource } from '../../config/data-source';
import { Review } from '../../entities/Review';
import { Patient } from '../../entities/Patient';
import { Appointment } from '../../entities/Appointment';
import { Errors } from '../../utils/errors';
import { QueryFailedError } from 'typeorm';

export interface CreateReviewDto {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export class ReviewService {
  private repo = () => AppDataSource.getRepository(Review);

  async create(patientUserId: string, dto: CreateReviewDto): Promise<Review> {
    if (!dto.rating || dto.rating < 1 || dto.rating > 5)
      throw Errors.badRequest('Il rating deve essere compreso tra 1 e 5');
    const patient = await AppDataSource.getRepository(Patient).findOne({
      where: { user: { id: patientUserId } },
      relations: ['user'],
    });
    if (!patient) throw Errors.badRequest('Profilo paziente non trovato');

    const appt = await AppDataSource.getRepository(Appointment).findOne({
      where: { id: dto.appointmentId },
      relations: ['patient', 'patient.user', 'doctor'],
    });
    if (!appt) throw Errors.notFound('Appuntamento non trovato');
    if (appt.patient.user.id !== patientUserId)
      throw Errors.forbidden('Non puoi recensire questo appuntamento', 'REVIEW_FORBIDDEN');
    if (appt.status !== 'completed')
      throw Errors.conflict('Puoi recensire solo le visite completate', 'APPOINTMENT_NOT_COMPLETED');
    const existing = await this.repo().findOne({ where: { appointment: { id: appt.id } } });
    if (existing) throw Errors.conflict('Hai gia recensito questa visita', 'REVIEW_ALREADY_EXISTS');

    const review = this.repo().create({
      patient,
      doctor: appt.doctor,
      appointment: appt,
      rating: Math.round(dto.rating),
      comment: dto.comment,
    });
    try {
      return await this.repo().save(review);
    } catch (error) {
      if (error instanceof QueryFailedError && String(error.message).includes('UNIQUE constraint failed'))
        throw Errors.conflict('Hai gia recensito questa visita', 'REVIEW_ALREADY_EXISTS');
      throw error;
    }
  }

  async listByDoctor(doctorId: string) {
    const reviews = await this.repo().find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'patient.user', 'appointment'],
      order: { createdAt: 'DESC' },
    });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return {
      doctorId,
      count: reviews.length,
      average: Number(avg.toFixed(1)),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        patient: {
          firstName: r.patient.user.firstName,
          lastInitial: r.patient.user.lastName?.charAt(0).toUpperCase(),
        },
      })),
    };
  }

  async listByPatient(patientUserId: string) {
    const patient = await AppDataSource.getRepository(Patient).findOne({
      where: { user: { id: patientUserId } },
    });
    if (!patient) throw Errors.badRequest('Profilo paziente non trovato');
    return this.repo().find({
      where: { patient: { id: patient.id } },
      relations: ['doctor', 'doctor.user', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async byAppointment(appointmentId: string, patientUserId: string) {
    const patient = await AppDataSource.getRepository(Patient).findOne({
      where: { user: { id: patientUserId } },
    });
    if (!patient) throw Errors.badRequest('Profilo paziente non trovato');
    return (
      this.repo().findOne({
        where: { appointment: { id: appointmentId }, patient: { id: patient.id } },
        relations: ['doctor', 'doctor.user'],
      }) ?? null
    );
  }
}
