import { Showtime } from '../../domain/entities/Showtime.entity';
import { IMovieRepository } from './SoftDeleteMovie.usecase';
import { ICinemaHallRepository } from './CreateHall.usecase';

export interface ScheduleShowtimeInput {
  hallId: string;
  movieId: string;
  startTime: Date | string;
  priceCents: number;
}

export interface IShowtimeRepository {
  save(showtime: Showtime): Promise<Showtime>;
  findShowtimesByHall(hallId: string): Promise<Showtime[]>;
  findShowtimeById(id: string): Promise<Showtime | null>;
  findAll(): Promise<Showtime[]>;
}

export class InMemoryShowtimeRepository implements IShowtimeRepository {
  private showtimes: Map<string, Showtime> = new Map();

  constructor(initial: Showtime[] = []) {
    for (const s of initial) {
      this.showtimes.set(s.id, s);
    }
  }

  async save(showtime: Showtime): Promise<Showtime> {
    this.showtimes.set(showtime.id, showtime);
    return showtime;
  }

  async findShowtimesByHall(hallId: string): Promise<Showtime[]> {
    return Array.from(this.showtimes.values()).filter(s => s.hallId === hallId && s.isActive);
  }

  async findShowtimeById(id: string): Promise<Showtime | null> {
    return this.showtimes.get(id) || null;
  }

  async findAll(): Promise<Showtime[]> {
    return Array.from(this.showtimes.values()).filter(s => s.isActive);
  }
}

export class ScheduleShowtimeUseCase {
  constructor(
    private readonly showtimeRepository: IShowtimeRepository,
    private readonly movieRepository: IMovieRepository,
    private readonly hallRepository: ICinemaHallRepository
  ) {}

  async execute(input: ScheduleShowtimeInput): Promise<Showtime> {
    if (!input.hallId || input.hallId.trim() === '') {
      throw new Error('El ID de la sala es obligatorio.');
    }
    if (!input.movieId || input.movieId.trim() === '') {
      throw new Error('El ID de la película es obligatorio.');
    }
    if (input.priceCents <= 0) {
      throw new Error('El precio de la función debe ser mayor a 0 Bs.');
    }

    const startDate = typeof input.startTime === 'string' ? new Date(input.startTime) : input.startTime;
    if (isNaN(startDate.getTime())) {
      throw new Error('La fecha/hora de inicio no es válida.');
    }

    // 1. Validar que la sala exista
    const hall = await this.hallRepository.findHallById(input.hallId);
    if (!hall || !hall.isActive) {
      throw new Error(`La sala con ID ${input.hallId} no existe o no se encuentra activa.`);
    }

    // 2. Validar que la película exista y no esté borrada lógicamente
    const movie = await this.movieRepository.findById(input.movieId);
    if (!movie) {
      throw new Error(`La película con ID ${input.movieId} no existe.`);
    }
    if (movie.isDeleted) {
      throw new Error(`No se puede programar una función para la película "${movie.title}" porque ha sido desactivada del catálogo.`);
    }

    // 3. Validar colisión con buffer obligatorio de 20 minutos (RB-01.1 / INV-BIZ-01)
    const existingShowtimes = await this.showtimeRepository.findShowtimesByHall(input.hallId);

    for (const existing of existingShowtimes) {
      if (existing.conflictsWith(startDate, movie.durationMinutes)) {
        const existingEndStr = existing.availableUntilWithBuffer.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const existingStartStr = existing.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        throw new Error(
          `Conflicto de programación en "${hall.name}": Ya existe una función (${existingStartStr} — ${existingEndStr} con buffer de 20 min). Se solapa con el horario solicitado.`
        );
      }
    }

    // 4. Crear y persistir la función
    const showtimeId = `show-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newShowtime = new Showtime(
      showtimeId,
      input.hallId,
      input.movieId,
      startDate,
      movie.durationMinutes,
      input.priceCents,
      true
    );

    return await this.showtimeRepository.save(newShowtime);
  }
}
