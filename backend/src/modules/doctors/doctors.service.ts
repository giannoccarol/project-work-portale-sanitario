import { AppDataSource } from '../../config/data-source';
import { Doctor } from '../../entities/Doctor';
import { User } from '../../entities/User';
import { Structure } from '../../entities/Structure';
import { Specialization } from '../../entities/Specialization';
import { hashPassword } from '../../utils/auth';
import { Errors } from '../../utils/errors';
import { Page, PageRequest, pageWindow, toPage } from '../../utils/pagination';

export interface DoctorDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  specializationId?: string;
  structureId: string;
  bio?: string;
}

export class DoctorService {
  private repo = () => AppDataSource.getRepository(Doctor);

  async list(page: PageRequest, opts: { specializationId?: string; structureId?: string } = {}): Promise<Page<Doctor>> {
    const where: Record<string, unknown> = { isActive: true };
    if (opts.structureId) where.structure = { id: opts.structureId };
    if (opts.specializationId) where.specialization = { id: opts.specializationId };
    return toPage(await this.repo().findAndCount({
      where,
      relations: ['user', 'specialization', 'structure'],
      order: { id: 'ASC' },
      ...pageWindow(page),
    }), page);
  }

  async listAll(page: PageRequest): Promise<Page<Doctor>> {
    return toPage(await this.repo().findAndCount({
      relations: ['user', 'specialization', 'structure'],
      order: { id: 'ASC' },
      ...pageWindow(page),
    }), page);
  }

  async get(id: string, includeInactive = false): Promise<Doctor> {
    const d = await this.repo().findOne({
      where: includeInactive ? { id } : { id, isActive: true },
      relations: ['user', 'specialization', 'structure'],
    });
    if (!d) throw Errors.notFound('Medico non trovato');
    return d;
  }

  async create(dto: DoctorDto): Promise<Doctor> {
    if (!dto.email || !dto.password || !dto.structureId)
      throw Errors.badRequest('email, password e structureId obbligatori');
    const userRepo = AppDataSource.getRepository(User);
    const email = dto.email.trim().toLowerCase();
    if (await userRepo.findOne({ where: { email } }))
      throw Errors.conflict('Email gia registrata');
    const structure = await AppDataSource.getRepository(Structure).findOne({
      where: { id: dto.structureId, isActive: true },
    });
    if (!structure) throw Errors.badRequest('Struttura non attiva', 'STRUCTURE_INVALID');
    let specialization: Specialization | undefined;
    if (dto.specializationId) {
      specialization = (await AppDataSource.getRepository(Specialization).findOne({
        where: { id: dto.specializationId, isActive: true },
        relations: ['structure'],
      })) ?? undefined;
      if (!specialization || specialization.structure.id !== structure.id)
        throw Errors.badRequest('Specializzazione non valida per la struttura', 'SPECIALIZATION_INVALID');
    }

    const user = new User();
    user.email = email;
    user.passwordHash = await hashPassword(dto.password);
    user.role = 'doctor';
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;

    const doctor = new Doctor();
    doctor.user = user;
    doctor.structure = structure;
    doctor.bio = dto.bio;
    doctor.isActive = true;
    if (specialization) doctor.specialization = specialization;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const savedUser = await queryRunner.manager.save(user);
      doctor.user = savedUser;
      const saved = await queryRunner.manager.save(doctor);
      await queryRunner.commitTransaction();
      return this.get(saved.id);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: Partial<DoctorDto>): Promise<Doctor> {
    const d = await this.get(id, true);
    if (dto.bio !== undefined) d.bio = dto.bio;
    if (dto.structureId !== undefined) {
      const structure = await AppDataSource.getRepository(Structure).findOne({
        where: { id: dto.structureId, isActive: true },
      });
      if (!structure) throw Errors.badRequest('Struttura non attiva', 'STRUCTURE_INVALID');
      d.structure = structure;
      if (dto.specializationId === undefined) d.specialization = null;
    }
    if (dto.specializationId !== undefined) {
      const specialization = await AppDataSource.getRepository(Specialization).findOne({
        where: { id: dto.specializationId, isActive: true },
        relations: ['structure'],
      });
      if (!specialization || specialization.structure.id !== d.structure.id)
        throw Errors.badRequest('Specializzazione non valida per la struttura', 'SPECIALIZATION_INVALID');
      d.specialization = specialization;
    }
    if (dto.firstName !== undefined) d.user.firstName = dto.firstName;
    if (dto.lastName !== undefined) d.user.lastName = dto.lastName;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(d.user);
      await queryRunner.manager.save(d);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
    return this.get(id, true);
  }

  async setActive(id: string, isActive: boolean): Promise<Doctor> {
    const d = await this.get(id, true);
    if (isActive) {
      if (!d.structure.isActive)
        throw Errors.conflict('Ripristina prima la struttura', 'ARCHIVE_DEPENDENCY');
      if (d.specialization && !d.specialization.isActive)
        throw Errors.conflict('Ripristina prima la specializzazione', 'ARCHIVE_DEPENDENCY');
    }
    d.isActive = isActive;
    await this.repo().save(d);
    return this.get(id, true);
  }

  async remove(id: string): Promise<void> {
    const d = await this.get(id);
    await this.repo().remove(d);
  }
}
