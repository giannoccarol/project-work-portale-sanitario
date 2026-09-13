import { AppDataSource } from '../../config/data-source';
import { User } from '../../entities/User';
import { Patient } from '../../entities/Patient';
import { Structure } from '../../entities/Structure';
import { Doctor } from '../../entities/Doctor';
import { hashPassword, verifyPassword, generateToken } from '../../utils/auth';
import { Errors } from '../../utils/errors';
import { toDoctorDto, toPatientDto, toPublicUser } from '../../utils/dto';
import { QueryFailedError } from 'typeorm';
import { isValidCalendarDate, zonedDateTimeToUtc } from '../../utils/time';

export interface RegisterPatientDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  structureId: string;
  fiscalCode: string;
  birthDate: string;
}

export interface LoginResult {
  token: string;
  user: { id: string; email: string; role: string; firstName?: string; lastName?: string };
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    email = email.trim().toLowerCase();
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) throw Errors.unauthorized('Credenziali non valide', 'AUTH_INVALID_CREDENTIALS');
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw Errors.unauthorized('Credenziali non valide', 'AUTH_INVALID_CREDENTIALS');
    if (user.role === 'doctor') {
      const doctor = await AppDataSource.getRepository(Doctor).findOne({
        where: { user: { id: user.id } },
      });
      if (!doctor?.isActive)
        throw Errors.forbidden('Account medico archiviato', 'DOCTOR_ARCHIVED');
    }
    return {
      token: generateToken({ sub: user.id, email: user.email, role: user.role }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async registerPatient(dto: RegisterPatientDto): Promise<LoginResult> {
    const email = dto.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email))
      throw Errors.badRequest('Indirizzo email non valido', 'EMAIL_INVALID');
    if (dto.password.length < 8)
      throw Errors.badRequest('La password deve avere almeno 8 caratteri', 'PASSWORD_TOO_SHORT');
    const fiscalCode = dto.fiscalCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{16}$/.test(fiscalCode))
      throw Errors.badRequest('Codice fiscale non valido', 'FISCAL_CODE_INVALID');
    const birthDate = zonedDateTimeToUtc(dto.birthDate, '12:00');
    if (!isValidCalendarDate(dto.birthDate) || !birthDate || birthDate >= new Date())
      throw Errors.badRequest('Data di nascita non valida', 'BIRTH_DATE_INVALID');
    const firstName = dto.firstName.trim();
    const lastName = dto.lastName.trim();
    if (!firstName || !lastName)
      throw Errors.badRequest('Nome e cognome sono obbligatori', 'REGISTRATION_FIELDS_REQUIRED');

    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) throw Errors.conflict('Email gia registrata', 'EMAIL_ALREADY_REGISTERED');
    const existingFiscalCode = await AppDataSource.getRepository(Patient).findOne({ where: { fiscalCode } });
    if (existingFiscalCode)
      throw Errors.conflict('Codice fiscale gia registrato', 'FISCAL_CODE_ALREADY_REGISTERED');
    const structureRepo = AppDataSource.getRepository(Structure);
    const structure = await structureRepo.findOne({ where: { id: dto.structureId } });
    if (!structure?.isActive) throw Errors.badRequest('Struttura non valida', 'STRUCTURE_INVALID');

    const user = new User();
    user.email = email;
    user.passwordHash = await hashPassword(dto.password);
    user.role = 'patient';
    user.firstName = firstName;
    user.lastName = lastName;

    const patient = new Patient();
    patient.user = user;
    patient.structure = structure;
    patient.fiscalCode = fiscalCode;
    patient.birthDate = dto.birthDate;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const savedUser = await queryRunner.manager.save(user);
      patient.user = savedUser;
      await queryRunner.manager.save(patient);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e instanceof QueryFailedError) {
        const message = String(e.message);
        if (message.includes('patient.fiscal_code'))
          throw Errors.conflict('Codice fiscale gia registrato', 'FISCAL_CODE_ALREADY_REGISTERED');
        if (message.includes('user.email'))
          throw Errors.conflict('Email gia registrata', 'EMAIL_ALREADY_REGISTERED');
      }
      throw e;
    } finally {
      await queryRunner.release();
    }

    return {
      token: generateToken({ sub: user.id, email: user.email, role: user.role }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async me(userId: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ['patient', 'patient.structure', 'doctor', 'doctor.specialization', 'doctor.structure'],
    });
    if (!user) throw Errors.notFound('Utente non trovato');
    return {
      ...toPublicUser(user),
      patient: user.patient ? toPatientDto(user.patient, true) : undefined,
      doctor: user.doctor ? toDoctorDto(user.doctor) : undefined,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!currentPassword || !newPassword) throw Errors.badRequest('Password attuale e nuova password sono obbligatorie');
    if (newPassword.length < 8) throw Errors.badRequest('La nuova password deve avere almeno 8 caratteri');

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) throw Errors.notFound('Utente non trovato');

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) throw Errors.unauthorized('Password attuale non corretta');

    user.passwordHash = await hashPassword(newPassword);
    await userRepo.save(user);
  }
}
