import { Movie } from '../../domain/entities/Movie.entity';
import { IMediaHubClient } from '../../infrastructure/external/MediaHubClient';

export interface IMovieRepository {
  save(movie: Movie): Promise<Movie>;
  findById(id: string): Promise<Movie | null>;
  findAll(includeDeleted?: boolean): Promise<Movie[]>;
}

export class InMemoryMovieRepository implements IMovieRepository {
  private movies: Map<string, Movie> = new Map();

  constructor(initialMovies: Movie[] = []) {
    for (const m of initialMovies) {
      this.movies.set(m.id, m);
    }
  }

  async save(movie: Movie): Promise<Movie> {
    this.movies.set(movie.id, movie);
    return movie;
  }

  async findById(id: string): Promise<Movie | null> {
    return this.movies.get(id) || null;
  }

  async findAll(includeDeleted: boolean = false): Promise<Movie[]> {
    const list = Array.from(this.movies.values());
    if (includeDeleted) return list;
    return list.filter(m => !m.isDeleted);
  }
}

export class SoftDeleteMovieUseCase {
  constructor(
    private readonly movieRepository: IMovieRepository,
    private readonly mediaHubClient?: IMediaHubClient
  ) {}

  async execute(movieId: string): Promise<Movie> {
    if (!movieId || movieId.trim() === '') {
      throw new Error('El ID de la película es obligatorio para el borrado lógico.');
    }

    const movie = await this.movieRepository.findById(movieId);
    if (!movie) {
      throw new Error(`No se encontró la película con ID: ${movieId}`);
    }

    if (movie.isDeleted) {
      throw new Error(`La película "${movie.title}" ya ha sido desactivada previamente.`);
    }

    // 1. Borrado lógico estricto en persistencia (invariante INV-BIZ-07)
    movie.markAsDeleted();
    const savedMovie = await this.movieRepository.save(movie);

    // 2. Borrado físico del afiche en MinIO/S3 (RB-07.3 / SC-03)
    if (this.mediaHubClient && movie.posterUrl) {
      await this.mediaHubClient.deleteAsset(movie.posterUrl);
    }

    return savedMovie;
  }
}
