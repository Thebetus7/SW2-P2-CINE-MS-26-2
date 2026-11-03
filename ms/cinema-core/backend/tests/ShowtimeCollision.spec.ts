import { Showtime } from '../src/domain/entities/Showtime.entity';
import { Movie } from '../src/domain/entities/Movie.entity';
import { CinemaHall } from '../src/domain/entities/CinemaHall.entity';
import {
  ScheduleShowtimeUseCase,
  InMemoryShowtimeRepository,
} from '../src/application/use-cases/ScheduleShowtime.usecase';
import { InMemoryMovieRepository } from '../src/application/use-cases/SoftDeleteMovie.usecase';
import { InMemoryCinemaHallRepository } from '../src/application/use-cases/CreateHall.usecase';

describe('ShowtimeCollision Unit Tests (RB-07.4, SC-04, INV-BIZ-01)', () => {
  let showtimeRepository: InMemoryShowtimeRepository;
  let movieRepository: InMemoryMovieRepository;
  let hallRepository: InMemoryCinemaHallRepository;
  let scheduleShowtimeUseCase: ScheduleShowtimeUseCase;

  const testHall = new CinemaHall('hall-01', 'complex-01', 'Sala 1 IMAX Laser', 'IMAX', 100);
  const testMovie = new Movie('mov-dune', 'Dune: Part Two', 'Secuela en Arrakis', 166, 'Sci-Fi', 'PG-13', 'dune.jpg');
  const shortMovie = new Movie('mov-short', 'Animación Corta', 'Cortometraje', 60, 'Animación', 'G', 'short.jpg');

  beforeEach(async () => {
    showtimeRepository = new InMemoryShowtimeRepository();
    movieRepository = new InMemoryMovieRepository([testMovie, shortMovie]);
    hallRepository = new InMemoryCinemaHallRepository([testHall]);
    scheduleShowtimeUseCase = new ScheduleShowtimeUseCase(
      showtimeRepository,
      movieRepository,
      hallRepository
    );
  });

  it('debe programar exitosamente una función y calcular su hora fin y buffer de 20 min', async () => {
    // 14:00:00 (Duración: 60 min -> Fin: 15:00:00, Buffer higienización hasta 15:20:00)
    const startTime = new Date('2026-11-10T14:00:00Z');
    const showtime = await scheduleShowtimeUseCase.execute({
      hallId: 'hall-01',
      movieId: 'mov-short',
      startTime,
      priceCents: 4500,
    });

    expect(showtime).toBeDefined();
    expect(showtime.hallId).toBe('hall-01');
    expect(showtime.durationMinutes).toBe(60);
    expect(Showtime.CLEANING_BUFFER_MINUTES).toBe(20);

    // Verificación matemática de horas
    const expectedEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const expectedBufferTime = new Date(expectedEndTime.getTime() + 20 * 60 * 1000);

    expect(showtime.endTime.getTime()).toBe(expectedEndTime.getTime());
    expect(showtime.availableUntilWithBuffer.getTime()).toBe(expectedBufferTime.getTime());
  });

  it('debe rechazar una función que inicie dentro del horario de proyección directa', async () => {
    // Función 1: 14:00 a 15:00 (+20m buffer hasta 15:20)
    await scheduleShowtimeUseCase.execute({
      hallId: 'hall-01',
      movieId: 'mov-short',
      startTime: new Date('2026-11-10T14:00:00Z'),
      priceCents: 4500,
    });

    // Intento de Función 2 a las 14:30 (en pleno transcurso de la película)
    await expect(
      scheduleShowtimeUseCase.execute({
        hallId: 'hall-01',
        movieId: 'mov-short',
        startTime: new Date('2026-11-10T14:30:00Z'),
        priceCents: 4500,
      })
    ).rejects.toThrow(/Conflicto de programación en "Sala 1 IMAX Laser"/);
  });

  it('debe rechazar una función que inicie durante los 20 minutos obligatorios de higienización', async () => {
    // Función 1: 14:00 a 15:00 (+20m buffer hasta 15:20)
    await scheduleShowtimeUseCase.execute({
      hallId: 'hall-01',
      movieId: 'mov-short',
      startTime: new Date('2026-11-10T14:00:00Z'),
      priceCents: 4500,
    });

    // Intento de Función 2 a las 15:10 (dentro de los 20 min de limpieza posteriores)
    await expect(
      scheduleShowtimeUseCase.execute({
        hallId: 'hall-01',
        movieId: 'mov-short',
        startTime: new Date('2026-11-10T15:10:00Z'),
        priceCents: 4500,
      })
    ).rejects.toThrow(/Conflicto de programación/);
  });

  it('debe permitir programar una función que inicie exactamente al terminar los 20 minutos de higienización', async () => {
    // Función 1: 14:00 a 15:00 (Buffer termina exactamente a las 15:20:00)
    await scheduleShowtimeUseCase.execute({
      hallId: 'hall-01',
      movieId: 'mov-short',
      startTime: new Date('2026-11-10T14:00:00Z'),
      priceCents: 4500,
    });

    // Función 2: 15:20:00 (Inmediatamente después de concluida la higienización)
    const showtime2 = await scheduleShowtimeUseCase.execute({
      hallId: 'hall-01',
      movieId: 'mov-short',
      startTime: new Date('2026-11-10T15:20:00Z'),
      priceCents: 4500,
    });

    expect(showtime2).toBeDefined();
    expect(showtime2.startTime.toISOString()).toBe('2026-11-10T15:20:00.000Z');
  });

  it('debe rechazar funciones si la película fue desactivada mediante borrado lógico', async () => {
    const deletedMovie = new Movie('mov-del', 'Película Inactiva', '...', 120, 'Drama', 'R', '');
    deletedMovie.markAsDeleted();
    await movieRepository.save(deletedMovie);

    await expect(
      scheduleShowtimeUseCase.execute({
        hallId: 'hall-01',
        movieId: 'mov-del',
        startTime: new Date('2026-11-10T18:00:00Z'),
        priceCents: 4500,
      })
    ).rejects.toThrow(/ha sido desactivada del catálogo/);
  });
});
