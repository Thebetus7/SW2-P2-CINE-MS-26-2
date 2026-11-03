export const INITIAL_CINEMA_SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Complejos Cinematográficos
CREATE TABLE IF NOT EXISTS complexes (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de Salas de Cine
CREATE TABLE IF NOT EXISTS cinema_halls (
    id VARCHAR(100) PRIMARY KEY,
    complex_id VARCHAR(100) NOT NULL REFERENCES complexes(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    projection_type VARCHAR(50) NOT NULL DEFAULT '2D',
    total_capacity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de Butacas
CREATE TABLE IF NOT EXISTS seats (
    id VARCHAR(100) PRIMARY KEY,
    hall_id VARCHAR(100) NOT NULL REFERENCES cinema_halls(id) ON DELETE CASCADE,
    row_label VARCHAR(10) NOT NULL,
    column_number INT NOT NULL,
    seat_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_seat_in_hall UNIQUE (hall_id, row_label, column_number)
);

-- Tabla de Películas con Soft-Delete
CREATE TABLE IF NOT EXISTS movies (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    genre VARCHAR(100) NOT NULL,
    classification VARCHAR(50) NOT NULL DEFAULT 'TE',
    poster_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Tabla de Funciones con Índices para Detección de Colisiones
CREATE TABLE IF NOT EXISTS showtimes (
    id VARCHAR(100) PRIMARY KEY,
    hall_id VARCHAR(100) NOT NULL REFERENCES cinema_halls(id) ON DELETE RESTRICT,
    movie_id VARCHAR(100) NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL,
    price_cents INT NOT NULL DEFAULT 4000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_showtimes_hall_start ON showtimes(hall_id, start_time);
CREATE INDEX IF NOT EXISTS idx_movies_deleted_at ON movies(deleted_at);

-- Tabla de Catálogo Semilla de Confitería
CREATE TABLE IF NOT EXISTS candy_bar_items (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_cents INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
`;

export class InitialCinemaSchemaMigration {
  public async up(queryRunner: { query: (sql: string) => Promise<any> }): Promise<void> {
    await queryRunner.query(INITIAL_CINEMA_SCHEMA_SQL);
  }

  public async down(queryRunner: { query: (sql: string) => Promise<any> }): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS candy_bar_items;
      DROP TABLE IF EXISTS showtimes;
      DROP TABLE IF EXISTS movies;
      DROP TABLE IF EXISTS seats;
      DROP TABLE IF EXISTS cinema_halls;
      DROP TABLE IF EXISTS complexes;
    `);
  }
}
