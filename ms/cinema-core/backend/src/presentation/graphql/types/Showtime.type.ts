export interface ShowtimeGraphQLType {
  id: string;
  hallId: string;
  movieId: string;
  startTime: string;
  endTime: string;
  availableUntilWithBuffer: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleShowtimeGraphQLInput {
  hallId: string;
  movieId: string;
  startTime: string;
  priceCents: number;
}
