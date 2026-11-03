import { CreateMovieModalComponent, NewMovieData } from './create-movie-modal.component';
import { MoviesCatalogComponent } from './movies-catalog.component';

describe('CreateMovieModalComponent & MoviesCatalog (T4.2 / T4.3)', () => {
  let modal: CreateMovieModalComponent;
  let catalog: MoviesCatalogComponent;

  beforeEach(() => {
    modal = new CreateMovieModalComponent();
    catalog = new MoviesCatalogComponent();
  });

  it('debe aceptar pósters válidos menores a 5 MB (JPEG/PNG/WEBP)', () => {
    const validFile = {
      name: 'interstellar.jpg',
      size: 2.1 * 1024 * 1024, // 2.1 MB
      type: 'image/jpeg',
      dataUrl: 'data:image/jpeg;base64,sample...',
    };

    const isAccepted = modal.handlePosterSelection(validFile);

    expect(isAccepted).toBe(true);
    expect(modal.posterFile).toBeDefined();
    expect(modal.posterFile?.filename).toBe('interstellar.jpg');
    expect(modal.errorMessage).toBe('');
  });

  it('debe rechazar pósters que superan el límite de 5 MB con mensaje amigable', () => {
    const heavyFile = {
      name: 'avatar_raw_4k.png',
      size: 7.8 * 1024 * 1024, // 7.8 MB
      type: 'image/png',
    };

    const isAccepted = modal.handlePosterSelection(heavyFile);

    expect(isAccepted).toBe(false);
    expect(modal.posterFile).toBeUndefined();
    expect(modal.errorMessage).toContain('supera el límite máximo permitido de 5 MB');
  });

  it('debe rechazar formatos no permitidos como PDF o GIF', () => {
    const invalidFile = {
      name: 'sinopsis.pdf',
      size: 500 * 1024,
      type: 'application/pdf',
    };

    const isAccepted = modal.handlePosterSelection(invalidFile);

    expect(isAccepted).toBe(false);
    expect(modal.errorMessage).toContain('Formato no permitido: application/pdf');
  });

  it('debe generar sugerencias de etiquetas de IA según el género y sinopsis', () => {
    modal.title = 'Interstellar Odyssey';
    modal.synopsis = 'Un viaje a través de un agujero de gusano en el espacio profundo.';
    modal.genre = 'Ciencia Ficción / Drama';
    modal.generateAiTags();

    expect(modal.tags).toContain('#SciFi');
    expect(modal.tags).toContain('#IMAXRecommended');
  });

  it('debe permitir agregar y quitar tags manualmente', () => {
    modal.addTag('SonidoDolby');
    expect(modal.tags).toContain('#SonidoDolby');

    modal.removeTag('#SonidoDolby');
    expect(modal.tags).not.toContain('#SonidoDolby');
  });

  it('INV-BIZ-07: MoviesCatalogComponent debe aplicar borrado lógico preservando el historial', () => {
    expect(catalog.movies.length).toBe(3);
    expect(catalog.displayedMovies.length).toBe(3);

    // Desactivar Moana 2 (mov-003)
    catalog.softDeleteMovie('mov-003');

    // Catálogo activo muestra solo 2 películas
    expect(catalog.displayedMovies.length).toBe(2);
    expect(catalog.displayedMovies.some(m => m.id === 'mov-003')).toBe(false);

    // Con filtro de archivadas activado, se muestran las 3
    catalog.showArchived = true;
    expect(catalog.displayedMovies.length).toBe(3);
    const moana = catalog.displayedMovies.find(m => m.id === 'mov-003');
    expect(moana?.isDeleted).toBe(true);
    expect(moana?.deletedAt).toBeDefined();
  });
});
