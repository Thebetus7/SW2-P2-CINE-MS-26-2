import { CreateMovieModalComponent, NewMovieData } from './create-movie-modal.component';

export interface CatalogMovieItem {
  id: string;
  title: string;
  synopsis: string;
  durationMinutes: number;
  genre: string;
  classification: string;
  posterUrl: string;
  tags: string[];
  isDeleted: boolean;
  deletedAt?: Date | null;
}

export class MoviesCatalogComponent {
  public isModalOpen: boolean = false;
  public showArchived: boolean = false;
  public successMessage: string = '';

  public movies: CatalogMovieItem[] = [
    {
      id: 'mov-001',
      title: 'Dune: Part Two',
      synopsis: 'Paul Atreides se une a Chani y a los Fremen buscando venganza.',
      durationMinutes: 166,
      genre: 'Ciencia Ficción / Aventura',
      classification: 'P-14',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
      tags: ['#SciFi', '#IMAXRecommended', '#Blockbuster'],
      isDeleted: false,
    },
    {
      id: 'mov-002',
      title: 'Gladiator II',
      synopsis: 'El regreso a la arena del Coliseo romano.',
      durationMinutes: 148,
      genre: 'Acción / Épica',
      classification: 'P-18',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      tags: ['#Acción', '#Épica', '#EstrenoExclusivo'],
      isDeleted: false,
    },
    {
      id: 'mov-003',
      title: 'Moana 2',
      synopsis: 'Una nueva aventura oceánica para toda la familia.',
      durationMinutes: 100,
      genre: 'Animación / Aventura',
      classification: 'TE',
      posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800',
      tags: ['#Familiar', '#AptaParaTodos'],
      isDeleted: false,
    },
  ];

  get displayedMovies(): CatalogMovieItem[] {
    if (this.showArchived) {
      return this.movies;
    }
    return this.movies.filter(m => !m.isDeleted);
  }

  openCreateModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  handleSaveMovie(data: NewMovieData): void {
    const newId = `mov-${Date.now().toString().slice(-4)}`;
    const posterUrl = data.poster?.previewUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800';

    this.movies.unshift({
      id: newId,
      title: data.title,
      synopsis: data.synopsis,
      durationMinutes: data.durationMinutes,
      genre: data.genre,
      classification: data.classification,
      posterUrl,
      tags: data.tags,
      isDeleted: false,
    });

    this.isModalOpen = false;
    this.successMessage = `¡Película "${data.title}" registrada exitosamente con póster optimizado y tags de IA!`;
  }

  softDeleteMovie(movieId: string): void {
    const movie = this.movies.find(m => m.id === movieId);
    if (movie) {
      // Invariante INV-BIZ-07: Borrado lógico
      movie.isDeleted = true;
      movie.deletedAt = new Date();
      this.successMessage = `Película "${movie.title}" desactivada del catálogo público. El historial de funciones y ventas permanece intacto.`;
    }
  }

  restoreMovie(movieId: string): void {
    const movie = this.movies.find(m => m.id === movieId);
    if (movie) {
      movie.isDeleted = false;
      movie.deletedAt = null;
      this.successMessage = `Película "${movie.title}" reactivada en el catálogo.`;
    }
  }
}
