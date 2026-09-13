import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import { DataSource } from 'typeorm';
import * as entities from '../entities';
import { InitialSchema1787500000000 } from './1787500000000-InitialSchema';

describe('Initial database migration', () => {
  test('creates the complete schema with retention and uniqueness constraints', async () => {
    const directory = await fs.promises.mkdtemp(path.join(tmpdir(), 'puglia-salute-migration-'));
    const dataSource = new DataSource({
      type: 'better-sqlite3',
      database: path.join(directory, 'fresh.sqlite'),
      synchronize: false,
      entities: Object.values(entities) as unknown as Function[],
      migrations: [InitialSchema1787500000000],
    });

    try {
      await dataSource.initialize();
      await dataSource.runMigrations();

      const tables = (await dataSource.query(
        `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
      )) as Array<{ name: string }>;
      expect(tables.map(({ name }) => name)).toEqual(expect.arrayContaining([
        'appointment', 'doctor', 'patient', 'report', 'review', 'specialization', 'structure', 'user',
      ]));

      const indexes = (await dataSource.query(
        `SELECT name FROM sqlite_master WHERE type = 'index' ORDER BY name`,
      )) as Array<{ name: string }>;
      expect(indexes.map(({ name }) => name)).toEqual(expect.arrayContaining([
        'UQ_appointment_doctor_start_booked', 'UQ_patient_fiscal_code', 'UQ_review_appointment',
      ]));

      const foreignKeys = (await dataSource.query(`PRAGMA foreign_key_list('appointment')`)) as Array<{ on_delete: string }>;
      expect(foreignKeys).not.toHaveLength(0);
      expect(foreignKeys.every(({ on_delete }) => on_delete === 'RESTRICT')).toBe(true);
      await expect(dataSource.showMigrations()).resolves.toBe(false);
    } finally {
      if (dataSource.isInitialized) await dataSource.destroy();
      await fs.promises.rm(directory, { recursive: true, force: true });
    }
  });
});
