import { AppDataSource } from '../../config/data-source';
import { Specialization } from '../../entities/Specialization';
import { Errors } from '../../utils/errors';
import { Doctor } from '../../entities/Doctor';
import { Structure } from '../../entities/Structure';
import { Page, PageRequest, pageWindow, toPage } from '../../utils/pagination';

export interface SpecializationDto {
  name: string;
  description?: string;
  structureId: string;
}

export class SpecializationService {
  private repo = () => AppDataSource.getRepository(Specialization);

  async list(page: PageRequest, structureId?: string): Promise<Page<Specialization>> {
    const where = structureId ? { structure: { id: structureId }, isActive: true } : { isActive: true };
    return toPage(await this.repo().findAndCount({ where, relations: ['structure'], order: { name: 'ASC' }, ...pageWindow(page) }), page);
  }

  async listAll(page: PageRequest): Promise<Page<Specialization>> {
    return toPage(await this.repo().findAndCount({ relations: ['structure'], order: { name: 'ASC' }, ...pageWindow(page) }), page);
  }

  async get(id: string, includeInactive = false): Promise<Specialization> {
    const s = await this.repo().findOne({
      where: includeInactive ? { id } : { id, isActive: true },
      relations: ['structure'],
    });
    if (!s) throw Errors.notFound('Specializzazione non trovata');
    return s;
  }

  async create(dto: SpecializationDto): Promise<Specialization> {
    if (!dto.name || !dto.structureId) throw Errors.badRequest('name e structureId obbligatori');
    const structure = await AppDataSource.getRepository(Structure).findOne({
      where: { id: dto.structureId, isActive: true },
    });
    if (!structure) throw Errors.badRequest('Struttura non attiva', 'STRUCTURE_INVALID');
    const s = new Specialization();
    s.name = dto.name;
    s.description = dto.description;
    s.structure = structure;
    s.isActive = true;
    return this.repo().save(s);
  }

  async update(id: string, dto: Partial<SpecializationDto>): Promise<Specialization> {
    const s = await this.get(id, true);
    if (dto.name !== undefined) s.name = dto.name;
    if (dto.description !== undefined) s.description = dto.description;
    if (dto.structureId !== undefined) {
      const structure = await AppDataSource.getRepository(Structure).findOne({
        where: { id: dto.structureId, isActive: true },
      });
      if (!structure) throw Errors.badRequest('Struttura non attiva', 'STRUCTURE_INVALID');
      s.structure = structure;
    }
    return this.repo().save(s);
  }

  async setActive(id: string, isActive: boolean): Promise<Specialization> {
    const s = await this.get(id, true);
    if (!isActive) {
      const activeDoctors = await AppDataSource.getRepository(Doctor).count({
        where: { specialization: { id }, isActive: true },
      });
      if (activeDoctors)
        throw Errors.conflict('Archivia prima i medici attivi della specializzazione', 'ARCHIVE_DEPENDENCY');
    } else if (!s.structure.isActive) {
      throw Errors.conflict('Ripristina prima la struttura', 'ARCHIVE_DEPENDENCY');
    }
    s.isActive = isActive;
    return this.repo().save(s);
  }

  async remove(id: string): Promise<void> {
    const s = await this.get(id);
    await this.repo().remove(s);
  }
}
