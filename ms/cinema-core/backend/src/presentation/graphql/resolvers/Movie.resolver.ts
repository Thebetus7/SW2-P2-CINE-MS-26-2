import { CreateMovieWithMediaUseCase } from '../../../application/use-cases/CreateMovieWithMedia.usecase';
import { IMovieRepository, InMemoryMovieRepository, SoftDeleteMovieUseCase } from '../../../application/use-cases/SoftDeleteMovie.usecase';
import { CreateMovieGraphQLInput, MovieGraphQLType } from '../types/Movie.type';

export class MovieResolver {
  private createMovieUseCase: CreateMovieWithMediaUseCase;
  private softDeleteUseCase: SoftDeleteMovieUseCase;

  constructor(private readonly movieRepository: IMovieRepository = new InMemoryMovieRepository()) {
    this.createMovieUseCase = new CreateMovieWithMediaUseCase(this.movieRepository);
    this.softDeleteUseCase = new SoftDeleteMovieUseCase(this.movieRepository);
  }

  async getMovies(includeDeleted: boolean = false): Promise<MovieGraphQLType[]> {
    const list = await this.movieRepository.findAll(includeDeleted);
    return list.map(m => ({
      id: m.id,
      title: m.title,
      synopsis: m.synopsis,
      durationMinutes: m.durationMinutes,
      genre: m.genre,
      classification: m.classification,
      posterUrl: m.posterUrl,
      tags: m.tags,
      isDeleted: m.isDeleted,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));
  }

  async createMovie(input: CreateMovieGraphQLInput): Promise<MovieGraphQLType> {
    const poster = input.posterFilename && input.posterSizeBytes && input.posterMimeType
      ? {
          filename: input.posterFilename,
          sizeBytes: input.posterSizeBytes,
          mimeType: input.posterMimeType,
          urlOrBase64: input.posterUrl,
        }
      : undefined;

    const movie = await this.createMovieUseCase.execute({
      title: input.title,
      synopsis: input.synopsis,
      durationMinutes: input.durationMinutes,
      genre: input.genre,
      classification: input.classification,
      poster,
      tags: input.tags,
      suggestAiTags: input.suggestAiTags,
    });

    return {
      id: movie.id,
      title: movie.title,
      synopsis: movie.synopsis,
      durationMinutes: movie.durationMinutes,
      genre: movie.genre,
      classification: movie.classification,
      posterUrl: movie.posterUrl,
      tags: movie.tags,
      isDeleted: movie.isDeleted,
      createdAt: movie.createdAt.toISOString(),
      updatedAt: movie.updatedAt.toISOString(),
    };
  }

  async softDeleteMovie(movieId: string): Promise<MovieGraphQLType> {
    const movie = await this.softDeleteUseCase.execute(movieId);
    return {
      id: movie.id,
      title: movie.title,
      synopsis: movie.synopsis,
      durationMinutes: movie.durationMinutes,
      genre: movie.genre,
      classification: movie.classification,
      posterUrl: movie.posterUrl,
      tags: movie.tags,
      isDeleted: movie.isDeleted,
      createdAt: movie.createdAt.toISOString(),
      updatedAt: movie.updatedAt.toISOString(),
    };
  }
}
