import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { INITIAL_CINEMA_SCHEMA_SQL } from './001_InitialCinemaSchema';

dotenv.config();

export async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cinema_db';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('📦 Conectado a PostgreSQL para verificar/ejecutar migraciones DDL...');
    await client.query(INITIAL_CINEMA_SCHEMA_SQL);
    console.log('✅ Esquema inicial (001_InitialCinemaSchema) verificado y aplicado.');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 Migraciones completadas.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
