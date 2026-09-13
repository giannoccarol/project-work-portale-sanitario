import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as entities from '../entities';
import { InitialSchema1787500000000 } from '../migrations/1787500000000-InitialSchema';

const dbPath = process.env.DB_PATH || (process.env.NODE_ENV === 'test' ? ':memory:' : './data/policlinico.sqlite');
const synchronize = process.env.NODE_ENV === 'test' || process.env.DB_SYNCHRONIZE === 'true';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: dbPath,
  synchronize,
  logging: false,
  entities: Object.values(entities) as unknown as Function[],
  migrations: [InitialSchema1787500000000],
});

export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    if (!synchronize) await AppDataSource.runMigrations();
  }
  return AppDataSource;
}
