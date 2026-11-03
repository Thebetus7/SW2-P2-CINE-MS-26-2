import { ICinemaHallRepository, InMemoryCinemaHallRepository } from '../../../application/use-cases/CreateHall.usecase';
import { ScheduleShowtimeUseCase, IShowtimeRepository, InMemoryShowtimeRepository } from '../../../application/use-cases/ScheduleShowtime.usecase';
import { IMovieRepository, InMemoryMovieRepository } from '../../../application/use-cases/SoftDeleteMovie.usecase';
import { ScheduleShowtimeGraphQLInput, ShowtimeGraphQLType } from '../types/Showtime.type';

export class ShowtimeResolver {
  private scheduleShowtimeUseCase: ScheduleShowtimeUseCase;

  constructor(
    private readonly showtimeRepository: IShowtimeRepository = new InMemoryShowtimeRepository(),
    private readonly movieRepository: IMovieRepository = new InMemoryMovieRepository(),
    private readonly hallRepository: ICinemaHallRepository = new InMemoryCinemaHallRepository()
  ) {
    this.scheduleShowtimeUseCase = new ScheduleShowtimeUseCase(
      this.showtimeRepository,
      this.movieRepository,
      this.hallRepository
    );
  }

  async getShowtimesByHall(hallId: string): Promise<ShowtimeGraphQLType[]> {
    const list = await this.showtimeRepository.findShowtimesByHall(hallId);
    return list.map(s => ({
      id: s.id,
      hallId: s.hallId,
      movieId: s.movieId,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      availableUntilWithBuffer: s.availableUntilWithBuffer.toISOString(),
      durationMinutes: s.durationMinutes,
      priceCents: s.priceCents,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  }

  async scheduleShowtime(input: ScheduleShowtimeGraphQLInput): Promise<ShowtimeGraphQLType> {
    const showtime = await this.scheduleShowtimeUseCase.execute({
      hallId: input.hallId,
      movieId: input.movieId,
      startTime: input.startTime,
      priceCents: input.priceCents,
    });

    return {
      id: showtime.id,
      hallId: showtime.hallId,
      movieId: showtime.movieId,
      startTime: showtime.startTime.toISOString(),
      endTime: showtime.endTime.toISOString(),
      availableUntilWithBuffer: showtime.availableUntilWithBuffer.toISOString(),
      durationMinutes: showtime.durationMinutes,
      priceCents: showtime.priceCents,
      isActive: showtime.isActive,
      createdAt: showtime.createdAt.toISOString(),
      updatedAt: showtime.updatedAt.toISOString(),
    };
  }
}
