import { AppDataSource } from '../../config/data-source';
import { Structure } from '../../entities/Structure';
import { Errors } from '../../utils/errors';
import { Doctor } from '../../entities/Doctor';
import { Specialization } from '../../entities/Specialization';
import { Page, PageRequest, pageWindow, toPage } from '../../utils/pagination';

export interface StructureDto {
  name: string;
  address?: string;
  phone?: string;
}

export class StructureService {
  private repo = () => AppDataSource.getRepository(Structure);

  async list(page: PageRequest): Promise<Page<Structure>> {
    return toPage(await this.repo().findAndCount({ where: { isActive: true }, order: { name: 'ASC' }, ...pageWindow(page) }), page);
  }

  async listAll(page: PageRequest): Promise<Page<Structure>> {
    return toPage(await this.repo().findAndCount({ order: { name: 'ASC' }, ...pageWindow(page) }), page);
  }

  async get(id: string, includeInactive = false): Promise<Structure> {
    const s = await this.repo().findOne({ where: includeInactive ? { id } : { id, isActive: true } });
    if (!s) throw Errors.notFound('Struttura non trovata');
    return s;
  }

  async create(dto: StructureDto): Promise<Structure> {
    if (!dto.name) throw Errors.badRequest('Il nome e obbligatorio');
    const s = new Structure();
    s.name = dto.name;
    s.address = dto.address;
    s.phone = dto.phone;
    s.isActive = true;
    return this.repo().save(s);
  }

  async update(id: string, dto: Partial<StructureDto>): Promise<Structure> {
    const s = await this.get(id, true);
    if (dto.name !== undefined) s.name = dto.name;
    if (dto.address !== undefined) s.address = dto.address;
    if (dto.phone !== undefined) s.phone = dto.phone;
    return this.repo().save(s);
  }

  async setActive(id: string, isActive: boolean): Promise<Structure> {
    const s = await this.get(id, true);
    if (!isActive) {
      const [activeDoctors, activeSpecializations] = await Promise.all([
        AppDataSource.getRepository(Doctor).count({ where: { structure: { id }, isActive: true } }),
        AppDataSource.getRepository(Specialization).count({ where: { structure: { id }, isActive: true } }),
      ]);
      if (activeDoctors || activeSpecializations)
        throw Errors.conflict(
          'Archivia prima medici e specializzazioni attivi della struttura',
          'ARCHIVE_DEPENDENCY',
        );
    }
    s.isActive = isActive;
    return this.repo().save(s);
  }

  async remove(id: string): Promise<void> {
    const s = await this.get(id);
    await this.repo().remove(s);
  }
}
