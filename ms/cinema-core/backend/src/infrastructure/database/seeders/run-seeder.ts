import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { CinemaDatabaseSeeder } from './CinemaDatabaseSeeder';
import { runMigrations } from '../migrations/run-migrations';

dotenv.config();

export async function runSeeder(): Promise<void> {
  // 1. Asegurar que el esquema y tablas existan en PostgreSQL
  await runMigrations();

  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cinema_db';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('🌱 Conectado a PostgreSQL para sembrar datos maestros...');

    const data = CinemaDatabaseSeeder.generateDemoData();

    // 2. Insertar Complejos
    for (const c of data.complexes) {
      await client.query(
        `INSERT INTO complexes (id, name, city, address, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE 
         SET name = EXCLUDED.name, city = EXCLUDED.city, address = EXCLUDED.address, updated_at = NOW()`,
        [c.id, c.name, c.city, c.address, c.isActive, c.createdAt, c.updatedAt]
      );
    }
    console.log(`✔️  ${data.complexes.length} Complejos cinematográficos sembrados.`);

    // 3. Insertar Salas
    for (const h of data.halls) {
      await client.query(
        `INSERT INTO cinema_halls (id, complex_id, name, projection_type, total_capacity, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE 
         SET name = EXCLUDED.name, projection_type = EXCLUDED.projection_type, total_capacity = EXCLUDED.total_capacity, updated_at = NOW()`,
        [h.id, h.complexId, h.name, h.projectionType, h.totalCapacity, h.isActive, h.createdAt, h.updatedAt]
      );
    }
    console.log(`✔️  ${data.halls.length} Salas de proyección sembradas.`);

    // 4. Insertar Butacas
    for (const s of data.seats) {
      await client.query(
        `INSERT INTO seats (id, hall_id, row_label, column_number, seat_type, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (hall_id, row_label, column_number) DO UPDATE 
         SET seat_type = EXCLUDED.seat_type, is_active = EXCLUDED.is_active, updated_at = NOW()`,
        [s.id, s.hallId, s.rowLabel, s.columnNumber, s.seatType, s.isActive, s.createdAt, s.updatedAt]
      );
    }
    console.log(`✔️  ${data.seats.length} Butacas generadas e indexadas.`);

    // 5. Insertar Películas
    for (const m of data.movies) {
      await client.query(
        `INSERT INTO movies (id, title, synopsis, duration_minutes, genre, classification, poster_url, tags, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE 
         SET title = EXCLUDED.title, synopsis = EXCLUDED.synopsis, poster_url = EXCLUDED.poster_url, tags = EXCLUDED.tags, updated_at = NOW()`,
        [m.id, m.title, m.synopsis, m.durationMinutes, m.genre, m.classification, m.posterUrl, JSON.stringify(m.tags), m.createdAt, m.updatedAt]
      );
    }
    console.log(`✔️  ${data.movies.length} Películas en cartelera sembradas.`);

    // 6. Insertar Funciones
    for (const sh of data.showtimes) {
      await client.query(
        `INSERT INTO showtimes (id, hall_id, movie_id, start_time, duration_minutes, price_cents, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE 
         SET start_time = EXCLUDED.start_time, duration_minutes = EXCLUDED.duration_minutes, price_cents = EXCLUDED.price_cents, updated_at = NOW()`,
        [sh.id, sh.hallId, sh.movieId, sh.startTime, sh.durationMinutes, sh.priceCents, sh.isActive, sh.createdAt, sh.updatedAt]
      );
    }
    console.log(`✔️  ${data.showtimes.length} Funciones programadas con buffer de 20 min sembradas.`);

    console.log('🎉 Semillero de datos de demostración completado exitosamente.');
  } catch (error) {
    console.error('❌ Error sembrando base de datos:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runSeeder()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
