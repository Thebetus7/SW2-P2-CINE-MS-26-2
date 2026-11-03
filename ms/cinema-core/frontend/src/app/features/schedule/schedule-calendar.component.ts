export interface ScheduledItem {
  id: string;
  hallId: string;
  hallName: string;
  movieId: string;
  movieTitle: string;
  startTime: Date;
  durationMinutes: number;
  priceBs: number;
}

export interface CollisionResult {
  hasCollision: boolean;
  conflictDetails?: string;
  blockedUntil?: Date;
}

export class ScheduleCalendarComponent {
  public static readonly CLEANING_BUFFER_MIN = 20;

  public selectedHallId: string = 'hall-c1-01';
  public showtimes: ScheduledItem[] = [
    {
      id: 'show-01',
      hallId: 'hall-c1-01',
      hallName: 'Sala 1 - MacroXE',
      movieId: 'mov-001',
      movieTitle: 'Dune: Part Two',
      startTime: new Date('2026-10-20T14:00:00Z'),
      durationMinutes: 166, // 14:00 a 16:46 -> libre a 17:06
      priceBs: 45,
    },
    {
      id: 'show-02',
      hallId: 'hall-c1-01',
      hallName: 'Sala 1 - MacroXE',
      movieId: 'mov-002',
      movieTitle: 'Gladiator II',
      startTime: new Date('2026-10-20T17:30:00Z'),
      durationMinutes: 148, // 17:30 a 19:58 -> libre a 20:18
      priceBs: 50,
    },
    {
      id: 'show-03',
      hallId: 'hall-c1-02',
      hallName: 'Sala 2 - 3D RealD',
      movieId: 'mov-003',
      movieTitle: 'Moana 2',
      startTime: new Date('2026-10-20T15:00:00Z'),
      durationMinutes: 100, // 15:00 a 16:40 -> libre a 17:00
      priceBs: 35,
    },
  ];

  public lastConflictMessage: string = '';
  public successMessage: string = '';

  getShowtimesForHall(hallId: string): ScheduledItem[] {
    return this.showtimes.filter(s => s.hallId === hallId);
  }

  getEndTime(item: ScheduledItem): Date {
    return new Date(item.startTime.getTime() + item.durationMinutes * 60 * 1000);
  }

  getAvailableAfterBuffer(item: ScheduledItem): Date {
    return new Date(item.startTime.getTime() + (item.durationMinutes + ScheduleCalendarComponent.CLEANING_BUFFER_MIN) * 60 * 1000);
  }

  checkCollision(hallId: string, candidateStart: Date, candidateDurationMin: number): CollisionResult {
    const candidateStartMs = candidateStart.getTime();
    const candidateOccupiedEndMs = candidateStartMs + (candidateDurationMin + ScheduleCalendarComponent.CLEANING_BUFFER_MIN) * 60 * 1000;

    const hallShowtimes = this.getShowtimesForHall(hallId);

    for (const existing of hallShowtimes) {
      const existingStartMs = existing.startTime.getTime();
      const existingOccupiedEndMs = this.getAvailableAfterBuffer(existing).getTime();

      // Solapamiento de intervalos
      if (candidateStartMs < existingOccupiedEndMs && existingStartMs < candidateOccupiedEndMs) {
        const untilStr = this.getAvailableAfterBuffer(existing).toISOString().substring(11, 16);
        const details = `SOLAPAMIENTO BLOQUEADO: La sala está ocupada por "${existing.movieTitle}" hasta las ${untilStr} UTC (incluyendo 20 min de buffer obligatorio de limpieza).`;
        return {
          hasCollision: true,
          conflictDetails: details,
          blockedUntil: this.getAvailableAfterBuffer(existing),
        };
      }
    }

    return { hasCollision: false };
  }

  scheduleNewShowtime(data: {
    hallId: string;
    hallName: string;
    movieId: string;
    movieTitle: string;
    startTime: Date;
    durationMinutes: number;
    priceBs: number;
  }): boolean {
    this.lastConflictMessage = '';
    this.successMessage = '';

    const collision = this.checkCollision(data.hallId, data.startTime, data.durationMinutes);
    if (collision.hasCollision) {
      this.lastConflictMessage = collision.conflictDetails || 'Conflicto de programación detectado.';
      return false;
    }

    const newItem: ScheduledItem = {
      id: `show-${Date.now().toString().slice(-4)}`,
      hallId: data.hallId,
      hallName: data.hallName,
      movieId: data.movieId,
      movieTitle: data.movieTitle,
      startTime: data.startTime,
      durationMinutes: data.durationMinutes,
      priceBs: data.priceBs,
    };

    this.showtimes.push(newItem);
    this.successMessage = `Función para "${data.movieTitle}" programada con éxito en ${data.hallName}.`;
    return true;
  }
}
