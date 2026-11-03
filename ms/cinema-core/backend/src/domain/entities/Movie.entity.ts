export class Movie {
  constructor(
    public readonly id: string,
    public title: string,
    public synopsis: string,
    public durationMinutes: number,
    public genre: string,
    public classification: string, // 'TE', 'P-14', 'P-18'
    public posterUrl: string,
    public tags: string[] = [],
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {}

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  markAsDeleted(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
