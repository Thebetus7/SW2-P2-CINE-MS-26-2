export class Showtime {
  public static readonly CLEANING_BUFFER_MINUTES = 20;

  constructor(
    public readonly id: string,
    public hallId: string,
    public movieId: string,
    public startTime: Date,
    public durationMinutes: number,
    public priceCents: number,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  get endTime(): Date {
    return new Date(this.startTime.getTime() + this.durationMinutes * 60 * 1000);
  }

  get availableUntilWithBuffer(): Date {
    return new Date(this.startTime.getTime() + (this.durationMinutes + Showtime.CLEANING_BUFFER_MINUTES) * 60 * 1000);
  }

  conflictsWith(otherStart: Date, otherDurationMinutes: number): boolean {
    const thisStart = this.startTime.getTime();
    const thisOccupiedEnd = this.availableUntilWithBuffer.getTime();

    const otherStartMs = otherStart.getTime();
    const otherOccupiedEnd = otherStartMs + (otherDurationMinutes + Showtime.CLEANING_BUFFER_MINUTES) * 60 * 1000;

    // Se solapan si un intervalo empieza antes de que el otro termine (incluyendo el buffer de limpieza de 20 min)
    return thisStart < otherOccupiedEnd && otherStartMs < thisOccupiedEnd;
  }
}
