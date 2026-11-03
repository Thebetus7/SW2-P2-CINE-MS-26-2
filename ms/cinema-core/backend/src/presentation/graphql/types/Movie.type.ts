export interface MovieGraphQLType {
  id: string;
  title: string;
  synopsis: string;
  durationMinutes: number;
  genre: string;
  classification: string;
  posterUrl: string;
  tags: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovieGraphQLInput {
  title: string;
  synopsis: string;
  durationMinutes: number;
  genre: string;
  classification: string;
  posterFilename?: string;
  posterSizeBytes?: number;
  posterMimeType?: string;
  posterUrl?: string;
  tags?: string[];
  suggestAiTags?: boolean;
}
