export type ProjectionType = '2D' | '3D' | 'CXC' | 'VIP' | 'IMAX';
export type SeatType = 'STANDARD' | 'VIP' | 'ACCESSIBLE' | 'EMPTY';

export interface InteractiveSeat {
  rowLabel: string;
  columnNumber: number;
  seatType: SeatType;
}

export interface NewHallData {
  complexId: string;
  name: string;
  projectionType: ProjectionType;
  rows: number;
  columns: number;
  seats: InteractiveSeat[];
  totalCapacity: number;
}

export class SimpleEventEmitter<T> {
  private listeners: ((val: T) => void)[] = [];

  subscribe(listener: (val: T) => void): { unsubscribe: () => void } {
    this.listeners.push(listener);
    return {
      unsubscribe: () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      }
    };
  }

  emit(val: T): void {
    for (const listener of this.listeners) {
      listener(val);
    }
  }
}

export class CreateHallModalComponent {
  public complexId: string = 'complex-central-01';
  public name: string = '';
  public projectionType: ProjectionType = '2D';
  public rows: number = 6;
  public columns: number = 10;
  public seats: InteractiveSeat[] = [];
  public errorMessage: string = '';

  public save = new SimpleEventEmitter<NewHallData>();
  public cancel = new SimpleEventEmitter<void>();

  constructor() {
    this.regenerateGrid();
  }

  get rowList(): string[] {
    return Array.from({ length: this.rows }, (_, i) => String.fromCharCode(65 + i));
  }

  get columnList(): number[] {
    return Array.from({ length: this.columns }, (_, i) => i + 1);
  }

  get activeSeatsCount(): number {
    return this.seats.filter(s => s.seatType !== 'EMPTY').length;
  }

  get standardCount(): number {
    return this.seats.filter(s => s.seatType === 'STANDARD').length;
  }

  get vipCount(): number {
    return this.seats.filter(s => s.seatType === 'VIP').length;
  }

  get accessibleCount(): number {
    return this.seats.filter(s => s.seatType === 'ACCESSIBLE').length;
  }

  get emptyCount(): number {
    return this.seats.filter(s => s.seatType === 'EMPTY').length;
  }

  regenerateGrid(): void {
    if (this.rows < 1) this.rows = 1;
    if (this.rows > 20) this.rows = 20;
    if (this.columns < 1) this.columns = 1;
    if (this.columns > 20) this.columns = 20;

    const newSeats: InteractiveSeat[] = [];
    for (let r = 0; r < this.rows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      for (let c = 1; c <= this.columns; c++) {
        let seatType: SeatType = 'STANDARD';
        if (r === 0 && (c === 1 || c === this.columns)) {
          seatType = 'ACCESSIBLE';
        }
        if (this.projectionType === 'VIP') {
          seatType = 'VIP';
        }
        newSeats.push({ rowLabel, columnNumber: c, seatType });
      }
    }
    this.seats = newSeats;
  }

  getSeatsByRow(row: string): InteractiveSeat[] {
    return this.seats.filter(s => s.rowLabel === row);
  }

  cycleSeatType(seat: InteractiveSeat): void {
    const cycleOrder: SeatType[] = ['STANDARD', 'VIP', 'ACCESSIBLE', 'EMPTY'];
    const currentIdx = cycleOrder.indexOf(seat.seatType);
    const nextIdx = (currentIdx + 1) % cycleOrder.length;
    seat.seatType = cycleOrder[nextIdx];
  }

  onSave(): void {
    this.errorMessage = '';
    if (!this.name.trim()) {
      this.errorMessage = 'Debe indicar un nombre para la sala.';
      return;
    }
    if (this.activeSeatsCount === 0) {
      this.errorMessage = 'La sala debe contar con al menos una butaca activa.';
      return;
    }

    this.save.emit({
      complexId: this.complexId,
      name: this.name.trim(),
      projectionType: this.projectionType,
      rows: this.rows,
      columns: this.columns,
      seats: this.seats,
      totalCapacity: this.activeSeatsCount,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
