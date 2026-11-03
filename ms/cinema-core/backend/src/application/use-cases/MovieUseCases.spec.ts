import { CreateMovieWithMediaUseCase } from './CreateMovieWithMedia.usecase';
import { InMemoryMovieRepository, SoftDeleteMovieUseCase } from './SoftDeleteMovie.usecase';
import { MovieResolver } from '../../presentation/graphql/resolvers/Movie.resolver';

describe('Movie Use Cases & MovieResolver (T4.1 / T4.3)', () => {
  let repository: InMemoryMovieRepository;
  let createUseCase: CreateMovieWithMediaUseCase;
  let softDeleteUseCase: SoftDeleteMovieUseCase;
  let resolver: MovieResolver;

  beforeEach(() => {
    repository = new InMemoryMovieRepository();
    createUseCase = new CreateMovieWithMediaUseCase(repository);
    softDeleteUseCase = new SoftDeleteMovieUseCase(repository);
    resolver = new MovieResolver(repository);
  });

  it('debe registrar una nueva película con póster válido (< 5MB) y tags de IA', async () => {
    const movie = await createUseCase.execute({
      title: 'Dune: Part Two',
      synopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.',
      durationMinutes: 166,
      genre: 'Ciencia Ficción / Aventura',
      classification: 'P-14',
      poster: {
        filename: 'dune2-poster.jpg',
        sizeBytes: 2.4 * 1024 * 1024, // 2.4 MB < 5 MB
        mimeType: 'image/jpeg',
        urlOrBase64: 'https://images.unsplash.com/photo-dune.jpg',
      },
      suggestAiTags: true,
    });

    expect(movie.id).toBeDefined();
    expect(movie.title).toBe('Dune: Part Two');
    expect(movie.durationMinutes).toBe(166);
    expect(movie.isDeleted).toBe(false);
    expect(movie.tags).toContain('#SciFi');
    expect(movie.tags).toContain('#IMAXRecommended');
  });

  it('debe rechazar la carga si el póster supera los 5 MB', async () => {
    const oversizedBytes = 6 * 1024 * 1024; // 6 MB

    await expect(
      createUseCase.execute({
        title: 'Pesada Movie',
        synopsis: 'Una película con póster 4K sin comprimir.',
        durationMinutes: 120,
        genre: 'Acción',
        classification: 'P-14',
        poster: {
          filename: 'poster_gigante.jpg',
          sizeBytes: oversizedBytes,
          mimeType: 'image/jpeg',
        },
      })
    ).rejects.toThrow('El archivo de póster supera el límite máximo permitido de 5 MB');
  });

  it('debe rechazar formatos MIME de póster no soportados', async () => {
    await expect(
      createUseCase.execute({
        title: 'Documento Secreto',
        synopsis: 'Película con póster en formato PDF.',
        durationMinutes: 90,
        genre: 'Misterio',
        classification: 'TE',
        poster: {
          filename: 'documento.pdf',
          sizeBytes: 1024 * 100,
          mimeType: 'application/pdf',
        },
      })
    ).rejects.toThrow('Formato de póster no soportado: application/pdf');
  });

  it('INV-BIZ-07: Debe aplicar borrado lógico (soft-delete) preservando el registro histórico', async () => {
    const movie = await createUseCase.execute({
      title: 'Película Antigua 1999',
      synopsis: 'Clásico del cine que saldrá de cartelera.',
      durationMinutes: 110,
      genre: 'Drama',
      classification: 'TE',
    });

    expect(movie.isDeleted).toBe(false);
    expect(movie.deletedAt).toBeNull();

    // Aplicar borrado lógico
    const deletedMovie = await softDeleteUseCase.execute(movie.id);

    expect(deletedMovie.isDeleted).toBe(true);
    expect(deletedMovie.deletedAt).not.toBeNull();
    expect(deletedMovie.deletedAt instanceof Date).toBe(true);

    // Verificar que la lista regular no la devuelve, pero includeDeleted=true sí
    const activeList = await repository.findAll(false);
    expect(activeList.some(m => m.id === movie.id)).toBe(false);

    const fullHistory = await repository.findAll(true);
    expect(fullHistory.some(m => m.id === movie.id)).toBe(true);
  });

  it('debe permitir operaciones mediante MovieResolver', async () => {
    const created = await resolver.createMovie({
      title: 'Gladiator II',
      synopsis: 'Años después de presenciar la muerte del venerado héroe Máximo.',
      durationMinutes: 148,
      genre: 'Acción / Épica',
      classification: 'P-18',
      suggestAiTags: true,
    });

    expect(created.id).toBeDefined();

    const movies = await resolver.getMovies(false);
    expect(movies.length).toBe(1);
    expect(movies[0].title).toBe('Gladiator II');

    const softDeleted = await resolver.softDeleteMovie(created.id);
    expect(softDeleted.isDeleted).toBe(true);

    const activeAfterDelete = await resolver.getMovies(false);
    expect(activeAfterDelete.length).toBe(0);
  });
});
