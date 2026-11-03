import { Movie } from '../src/domain/entities/Movie.entity';
import { SoftDeleteMovieUseCase, InMemoryMovieRepository } from '../src/application/use-cases/SoftDeleteMovie.usecase';
import { IMediaHubClient } from '../src/infrastructure/external/MediaHubClient';

describe('MovieHybridDelete Unit Tests (RB-07.3, SC-03)', () => {
  let movieRepository: InMemoryMovieRepository;
  let mockMediaHubClient: jest.Mocked<IMediaHubClient>;
  let softDeleteMovieUseCase: SoftDeleteMovieUseCase;

  beforeEach(() => {
    movieRepository = new InMemoryMovieRepository();
    mockMediaHubClient = {
      deleteAsset: jest.fn().mockResolvedValue(true),
    };
    softDeleteMovieUseCase = new SoftDeleteMovieUseCase(movieRepository, mockMediaHubClient);
  });

  it('debe ejecutar el borrado híbrido: SoftDelete en persistencia y HardDelete del afiche en S3', async () => {
    const movie = new Movie(
      'mov-001',
      'Gladiator II',
      'El épico regreso al coliseo romano',
      148,
      'Acción / Drama',
      'R',
      'http://localhost:8080/storage/posters/gladiator2.webp'
    );
    await movieRepository.save(movie);

    const result = await softDeleteMovieUseCase.execute('mov-001');

    // 1. Verificación de borrado lógico en entidad y persistencia
    expect(result.isDeleted).toBe(true);
    expect(result.deletedAt).toBeInstanceOf(Date);

    const fromDb = await movieRepository.findById('mov-001');
    expect(fromDb?.isDeleted).toBe(true);

    // 2. Verificación de eliminación física del afiche en S3/MinIO
    expect(mockMediaHubClient.deleteAsset).toHaveBeenCalledTimes(1);
    expect(mockMediaHubClient.deleteAsset).toHaveBeenCalledWith(
      'http://localhost:8080/storage/posters/gladiator2.webp'
    );
  });

  it('debe permitir el SoftDelete de una película sin afiche sin invocar el cliente S3', async () => {
    const movieWithoutPoster = new Movie(
      'mov-002',
      'Película Sin Póster',
      'Sin sinopsis detallada',
      90,
      'Comedia',
      'G',
      ''
    );
    await movieRepository.save(movieWithoutPoster);

    const result = await softDeleteMovieUseCase.execute('mov-002');

    expect(result.isDeleted).toBe(true);
    expect(mockMediaHubClient.deleteAsset).not.toHaveBeenCalled();
  });

  it('debe rechazar el borrado si la película ya ha sido desactivada previamente', async () => {
    const movie = new Movie('mov-003', 'Película Archivada', '...', 100, 'Drama', 'PG', 'poster.jpg');
    movie.markAsDeleted();
    await movieRepository.save(movie);

    await expect(softDeleteMovieUseCase.execute('mov-003')).rejects.toThrow(
      'La película "Película Archivada" ya ha sido desactivada previamente.'
    );
    expect(mockMediaHubClient.deleteAsset).not.toHaveBeenCalled();
  });

  it('debe rechazar IDs vacíos o nulos', async () => {
    await expect(softDeleteMovieUseCase.execute('')).rejects.toThrow(
      'El ID de la película es obligatorio para el borrado lógico.'
    );
    await expect(softDeleteMovieUseCase.execute('    ')).rejects.toThrow(
      'El ID de la película es obligatorio para el borrado lógico.'
    );
  });

  it('debe arrojar error si la película no existe en el repositorio', async () => {
    await expect(softDeleteMovieUseCase.execute('mov-non-existent')).rejects.toThrow(
      'No se encontró la película con ID: mov-non-existent'
    );
  });
});
