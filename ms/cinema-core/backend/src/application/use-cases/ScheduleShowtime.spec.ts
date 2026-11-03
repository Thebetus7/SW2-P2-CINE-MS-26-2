import { CinemaHall } from '../../domain/entities/CinemaHall.entity';
import { Movie } from '../../domain/entities/Movie.entity';
import { Showtime } from '../../domain/entities/Showtime.entity';
import { InMemoryCinemaHallRepository } from './CreateHall.usecase';
import { ScheduleShowtimeUseCase, InMemoryShowtimeRepository } from './ScheduleShowtime.usecase';
import { InMemoryMovieRepository } from './SoftDeleteMovie.usecase';

describe('ScheduleShowtimeUseCase & 20-min Buffer Algorithm (T5.1 / T5.3)', () => {
  let hallRepo: InMemoryCinemaHallRepository;
  let movieRepo: InMemoryMovieRepository;
  let showtimeRepo: InMemoryShowtimeRepository;
  let useCase: ScheduleShowtimeUseCase;

  const testHall = new CinemaHall('hall-1', 'comp-1', 'Sala 1 IMAX', 'IMAX', 200, true);
  // Película de 120 minutos (2 horas)
  const testMovie = new Movie('mov-1', 'Inception', 'Sueños dentro de sueños', 120, 'SciFi', 'P-14', 'url');
  // Película borrada lógicamente
  const deletedMovie = new Movie('mov-del', 'Deleted Film', 'Old', 90, 'Drama', 'TE', 'url', [], new Date(), new Date(), new Date());

  beforeEach(async () => {
    hallRepo = new InMemoryCinemaHallRepository();
    await hallRepo.createHallWithSeats(testHall, []);

    movieRepo = new InMemoryMovieRepository([testMovie, deletedMovie]);
    showtimeRepo = new InMemoryShowtimeRepository();

    useCase = new ScheduleShowtimeUseCase(showtimeRepo, movieRepo, hallRepo);
  });

  it('debe programar exitosamente una función en un horario libre', async () => {
    const startTime = new Date('2026-10-20T14:00:00Z');

    const result = await useCase.execute({
      hallId: 'hall-1',
      movieId: 'mov-1',
      startTime,
      priceCents: 4500, // 45.00 Bs
    });

    expect(result.id).toBeDefined();
    expect(result.hallId).toBe('hall-1');
    expect(result.durationMinutes).toBe(120);
    // 14:00 + 120 min = 16:00
    expect(result.endTime.toISOString()).toBe('2026-10-20T16:00:00.000Z');
    // 16:00 + 20 min buffer = 16:20
    expect(result.availableUntilWithBuffer.toISOString()).toBe('2026-10-20T16:20:00.000Z');
  });

  it('RB-01.1: debe rechazar solapamiento directo durante la proyección', async () => {
    // Primera función: 14:00 a 16:00 (buffer hasta 16:20)
    await useCase.execute({
      hallId: 'hall-1',
      movieId: 'mov-1',
      startTime: new Date('2026-10-20T14:00:00Z'),
      priceCents: 4500,
    });

    // Intento de segunda función: 15:00 (en medio de la primera)
    await expect(
      useCase.execute({
        hallId: 'hall-1',
        movieId: 'mov-1',
        startTime: new Date('2026-10-20T15:00:00Z'),
        priceCents: 4500,
      })
    ).rejects.toThrow('Conflicto de programación en "Sala 1 IMAX"');
  });

  it('INV-BIZ-01: debe rechazar si la función inicia durante los 20 min de buffer de limpieza', async () => {
    // Primera función: 14:00 a 16:00 (buffer hasta 16:20)
    await useCase.execute({
      hallId: 'hall-1',
      movieId: 'mov-1',
      startTime: new Date('2026-10-20T14:00:00Z'),
      priceCents: 4500,
    });

    // Intento de segunda función a las 16:10 (dentro de los 20 min de buffer obligatorio)
    await expect(
      useCase.execute({
        hallId: 'hall-1',
        movieId: 'mov-1',
        startTime: new Date('2026-10-20T16:10:00Z'),
        priceCents: 4500,
      })
    ).rejects.toThrow('Conflicto de programación en "Sala 1 IMAX"');
  });

  it('debe permitir programar exactamente después de los 20 min de buffer', async () => {
    // Primera función: 14:00 a 16:00 (buffer hasta 16:20)
    await useCase.execute({
      hallId: 'hall-1',
      movieId: 'mov-1',
      startTime: new Date('2026-10-20T14:00:00Z'),
      priceCents: 4500,
    });

    // Segunda función a las 16:20: Justo cuando el buffer de limpieza expira
    const secondShowtime = await useCase.execute({
      hallId: 'hall-1',
      movieId: 'mov-1',
      startTime: new Date('2026-10-20T16:20:00Z'),
      priceCents: 4500,
    });

    expect(secondShowtime.id).toBeDefined();
    expect(secondShowtime.startTime.toISOString()).toBe('2026-10-20T16:20:00.000Z');
  });

  it('INV-BIZ-07: debe rechazar la programación de una película eliminada lógicamente', async () => {
    await expect(
      useCase.execute({
        hallId: 'hall-1',
        movieId: 'mov-del',
        startTime: new Date('2026-10-20T18:00:00Z'),
        priceCents: 4000,
      })
    ).rejects.toThrow('ha sido desactivada del catálogo');
  });
});
