import { INITIAL_CINEMA_SCHEMA_SQL, InitialCinemaSchemaMigration } from './001_InitialCinemaSchema';
import { CinemaComplex } from '../../../domain/entities/CinemaComplex.entity';
import { CinemaHall } from '../../../domain/entities/CinemaHall.entity';
import { Seat } from '../../../domain/entities/Seat.entity';
import { Movie } from '../../../domain/entities/Movie.entity';
import { Showtime } from '../../../domain/entities/Showtime.entity';

describe('T1.2 [SETUP] InitialCinemaSchema & Domain Entities', () => {
  it('debe contener las 5 tablas maestras del cine en el script SQL de migración', () => {
    expect(INITIAL_CINEMA_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS complexes');
    expect(INITIAL_CINEMA_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS cinema_halls');
    expect(INITIAL_CINEMA_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS seats');
    expect(INITIAL_CINEMA_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS movies');
    expect(INITIAL_CINEMA_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS showtimes');
    expect(INITIAL_CINEMA_SCHEMA_SQL).toContain('deleted_at TIMESTAMP WITH TIME ZONE NULL');
  });

  it('debe instanciar entidades de dominio y validar relaciones básicas', () => {
    const complex = new CinemaComplex('c-1', 'Multiplex Centro', 'La Paz', 'Av. 16 de Julio');
    expect(complex.name).toBe('Multiplex Centro');

    const hall = new CinemaHall('h-1', complex.id, 'Sala 1 IMAX', 'IMAX', 120);
    expect(hall.projectionType).toBe('IMAX');

    const seat = new Seat('s-1', hall.id, 'A', 5, 'VIP');
    expect(seat.code).toBe('A5');
    expect(seat.seatType).toBe('VIP');

    const movie = new Movie('m-1', 'Gladiator II', 'Secuela épica', 148, 'Acción', 'P-18', 'https://minio/poster.jpg');
    expect(movie.isDeleted).toBe(false);
    movie.markAsDeleted();
    expect(movie.isDeleted).toBe(true);
    expect(movie.deletedAt).toBeInstanceOf(Date);
  });

  it('debe detectar correctamente solapamientos de funciones considerando el buffer de 20 min', () => {
    const start1 = new Date('2026-10-24T14:00:00Z');
    const showtime1 = new Showtime('sh-1', 'h-1', 'm-1', start1, 120, 4500); // 14:00 a 16:00 (+20 min = 16:20)

    // Intento de iniciar a las 16:10 (solapa con el buffer de limpieza de 20 min)
    const startOverlap = new Date('2026-10-24T16:10:00Z');
    expect(showtime1.conflictsWith(startOverlap, 90)).toBe(true);

    // Intento de iniciar a las 16:25 (posterior al buffer de limpieza)
    const startClean = new Date('2026-10-24T16:25:00Z');
    expect(showtime1.conflictsWith(startClean, 90)).toBe(false);
  });
});
