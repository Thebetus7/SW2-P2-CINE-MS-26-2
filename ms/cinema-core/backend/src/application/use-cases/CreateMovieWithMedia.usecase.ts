import { Movie } from '../../domain/entities/Movie.entity';
import { IMovieRepository } from './SoftDeleteMovie.usecase';

export interface PosterFileInput {
  filename: string;
  sizeBytes: number;
  mimeType: string;
  urlOrBase64?: string;
}

export interface CreateMovieInput {
  title: string;
  synopsis: string;
  durationMinutes: number;
  genre: string;
  classification: string; // 'TE' | 'P-14' | 'P-18'
  poster?: PosterFileInput;
  tags?: string[];
  suggestAiTags?: boolean;
}

export class CreateMovieWithMediaUseCase {
  private readonly MAX_POSTER_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(private readonly movieRepository: IMovieRepository) {}

  async execute(input: CreateMovieInput): Promise<Movie> {
    if (!input.title || input.title.trim() === '') {
      throw new Error('El título de la película es obligatorio.');
    }
    if (!input.synopsis || input.synopsis.trim() === '') {
      throw new Error('La sinopsis de la película es obligatoria.');
    }
    if (!input.durationMinutes || input.durationMinutes <= 0) {
      throw new Error('La duración en minutos debe ser mayor a 0.');
    }
    if (!['TE', 'P-14', 'P-18'].includes(input.classification)) {
      throw new Error('La clasificación debe ser una de: TE, P-14 o P-18.');
    }

    let posterUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800';

    if (input.poster) {
      if (input.poster.sizeBytes > this.MAX_POSTER_SIZE_BYTES) {
        throw new Error(`El archivo de póster supera el límite máximo permitido de 5 MB (${Math.round(input.poster.sizeBytes / 1024 / 1024)} MB).`);
      }
      if (!this.ALLOWED_MIME_TYPES.includes(input.poster.mimeType.toLowerCase())) {
        throw new Error(`Formato de póster no soportado: ${input.poster.mimeType}. Formatos válidos: JPEG, PNG, WEBP.`);
      }
      posterUrl = input.poster.urlOrBase64 || `/assets/posters/${input.poster.filename}`;
    }

    let finalTags: string[] = input.tags || [];

    if (input.suggestAiTags) {
      // Deducción o enriquecimiento predictivo de tags temáticos
      const suggestedTags = this.predictGenreTags(input.genre, input.title, input.synopsis);
      finalTags = Array.from(new Set([...finalTags, ...suggestedTags]));
    }

    const movieId = `movie-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMovie = new Movie(
      movieId,
      input.title.trim(),
      input.synopsis.trim(),
      input.durationMinutes,
      input.genre.trim(),
      input.classification,
      posterUrl,
      finalTags,
      new Date(),
      new Date(),
      null
    );

    return await this.movieRepository.save(newMovie);
  }

  private predictGenreTags(genre: string, title: string, synopsis: string): string[] {
    const text = `${genre} ${title} ${synopsis}`.toLowerCase();
    const tags: string[] = [];

    if (text.includes('acción') || text.includes('action') || text.includes('aventura')) {
      tags.push('#Acción', '#Adrenalina');
    }
    if (text.includes('sci-fi') || text.includes('ciencia ficción') || text.includes('espacio') || text.includes('dune')) {
      tags.push('#SciFi', '#EspacioProfundo', '#IMAXRecommended');
    }
    if (text.includes('terror') || text.includes('horror') || text.includes('miedo')) {
      tags.push('#Terror', '#SuspensoPsicológico');
    }
    if (text.includes('comedia') || text.includes('familiar') || text.includes('animación')) {
      tags.push('#Familiar', '#AptaParaTodoPúblico');
    }
    if (text.includes('drama') || text.includes('romance') || text.includes('historia')) {
      tags.push('#CineDeAutor', '#PremiosOscar');
    }

    if (tags.length === 0) {
      tags.push('#EstrenoExclusivo', '#CineCenter');
    }

    return tags;
  }
}
