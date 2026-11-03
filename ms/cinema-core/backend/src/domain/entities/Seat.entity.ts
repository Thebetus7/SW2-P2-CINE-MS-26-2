export type SeatType = 'STANDARD' | 'VIP' | 'ACCESSIBLE' | 'EMPTY';

export class Seat {
  constructor(
    public readonly id: string,
    public hallId: string,
    public rowLabel: string, // A, B, C...
    public columnNumber: number, // 1, 2, 3...
    public seatType: SeatType = 'STANDARD',
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  get code(): string {
    return `${this.rowLabel}${this.columnNumber}`;
  }
}
