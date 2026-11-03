import { SimpleEventEmitter } from '../halls/create-hall-modal.component';

export interface PosterData {
  filename: string;
  sizeBytes: number;
  mimeType: string;
  previewUrl?: string;
}

export interface NewMovieData {
  title: string;
  synopsis: string;
  durationMinutes: number;
  genre: string;
  classification: string;
  poster?: PosterData;
  tags: string[];
  suggestAiTags: boolean;
}

export class CreateMovieModalComponent {
  public title: string = '';
  public synopsis: string = '';
  public durationMinutes: number = 120;
  public genre: string = 'Acción / Ciencia Ficción';
  public classification: string = 'P-14';
  public suggestAiTags: boolean = true;
  public tags: string[] = ['#EstrenoExclusivo', '#CineCenter'];
  public posterFile?: PosterData;
  public errorMessage: string = '';

  public save = new SimpleEventEmitter<NewMovieData>();
  public cancel = new SimpleEventEmitter<void>();

  private readonly MAX_POSTER_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  handlePosterSelection(file: { name: string; size: number; type: string; dataUrl?: string }): boolean {
    this.errorMessage = '';

    if (file.size > this.MAX_POSTER_SIZE_BYTES) {
      this.errorMessage = `El archivo de póster supera el límite máximo permitido de 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
      return false;
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      this.errorMessage = `Formato no permitido: ${file.type}. Solo se aceptan imágenes JPEG, PNG o WEBP.`;
      return false;
    }

    this.posterFile = {
      filename: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
      previewUrl: file.dataUrl || `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800`,
    };

    if (this.suggestAiTags) {
      this.generateAiTags();
    }

    return true;
  }

  generateAiTags(): void {
    const text = `${this.genre} ${this.title} ${this.synopsis}`.toLowerCase();
    const newTags: string[] = [];

    if (text.includes('acción') || text.includes('aventura')) {
      newTags.push('#Acción', '#Adrenalina');
    }
    if (text.includes('ficción') || text.includes('sci-fi') || text.includes('dune') || text.includes('espacio')) {
      newTags.push('#SciFi', '#IMAXRecommended');
    }
    if (text.includes('terror') || text.includes('miedo')) {
      newTags.push('#Terror', '#Suspenso');
    }
    if (text.includes('familiar') || text.includes('animación')) {
      newTags.push('#Familiar', '#AptaParaTodos');
    }

    this.tags = Array.from(new Set([...this.tags, ...newTags]));
  }

  addTag(tag: string): void {
    const cleanTag = tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`;
    if (cleanTag && !this.tags.includes(cleanTag)) {
      this.tags.push(cleanTag);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  onSave(): void {
    this.errorMessage = '';
    if (!this.title.trim()) {
      this.errorMessage = 'El título de la película es obligatorio.';
      return;
    }
    if (!this.synopsis.trim()) {
      this.errorMessage = 'La sinopsis es obligatoria.';
      return;
    }
    if (this.durationMinutes <= 0) {
      this.errorMessage = 'La duración debe ser mayor a 0 minutos.';
      return;
    }

    if (this.suggestAiTags) {
      this.generateAiTags();
    }

    this.save.emit({
      title: this.title.trim(),
      synopsis: this.synopsis.trim(),
      durationMinutes: this.durationMinutes,
      genre: this.genre.trim(),
      classification: this.classification,
      poster: this.posterFile,
      tags: this.tags,
      suggestAiTags: this.suggestAiTags,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
