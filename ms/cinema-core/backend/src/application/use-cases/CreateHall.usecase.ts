import { CinemaHall, ProjectionType } from '../../domain/entities/CinemaHall.entity';
import { Seat, SeatType } from '../../domain/entities/Seat.entity';

export interface CreateSeatInput {
  rowLabel: string;
  columnNumber: number;
  seatType: SeatType;
  isActive?: boolean;
}

export interface CreateHallInput {
  complexId: string;
  name: string;
  projectionType: ProjectionType;
  rows: number;
  columns: number;
  customSeats?: CreateSeatInput[];
}

export interface HallWithSeats {
  hall: CinemaHall;
  seats: Seat[];
}

export interface ICinemaHallRepository {
  createHallWithSeats(hall: CinemaHall, seats: Seat[]): Promise<HallWithSeats>;
  findHallsByComplex(complexId: string): Promise<CinemaHall[]>;
  findHallById(hallId: string): Promise<CinemaHall | null>;
  findSeatsByHall(hallId: string): Promise<Seat[]>;
}

export class InMemoryCinemaHallRepository implements ICinemaHallRepository {
  private halls: Map<string, CinemaHall> = new Map();
  private seats: Map<string, Seat[]> = new Map();

  constructor(initialHalls: CinemaHall[] = []) {
    for (const h of initialHalls) {
      this.halls.set(h.id, h);
    }
  }

  async createHallWithSeats(hall: CinemaHall, seats: Seat[]): Promise<HallWithSeats> {
    this.halls.set(hall.id, hall);
    this.seats.set(hall.id, seats);
    return { hall, seats };
  }

  async findHallsByComplex(complexId: string): Promise<CinemaHall[]> {
    return Array.from(this.halls.values()).filter(h => h.complexId === complexId && h.isActive);
  }

  async findHallById(hallId: string): Promise<CinemaHall | null> {
    return this.halls.get(hallId) || null;
  }

  async findSeatsByHall(hallId: string): Promise<Seat[]> {
    return this.seats.get(hallId) || [];
  }
}

export class CreateHallUseCase {
  constructor(private readonly hallRepository: ICinemaHallRepository) {}

  async execute(input: CreateHallInput): Promise<HallWithSeats> {
    if (!input.complexId || input.complexId.trim() === '') {
      throw new Error('El ID del complejo es obligatorio.');
    }
    if (!input.name || input.name.trim() === '') {
      throw new Error('El nombre de la sala es obligatorio.');
    }
    if (!input.rows || input.rows <= 0 || input.rows > 26) {
      throw new Error('El número de filas debe ser un valor entre 1 y 26.');
    }
    if (!input.columns || input.columns <= 0 || input.columns > 30) {
      throw new Error('El número de columnas debe ser un valor entre 1 y 30.');
    }

    const hallId = `hall-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const seatsToCreate: Seat[] = [];

    // Mapeo de índices de fila a letras A..Z
    const getRowLetter = (rowIndex: number): string => String.fromCharCode(65 + rowIndex);

    if (input.customSeats && input.customSeats.length > 0) {
      // Uso de asientos personalizados provistos por la matriz interactiva del frontend
      for (const seatDef of input.customSeats) {
        if (seatDef.seatType !== 'EMPTY') {
          const seatId = `seat-${hallId}-${seatDef.rowLabel}${seatDef.columnNumber}`;
          seatsToCreate.push(
            new Seat(
              seatId,
              hallId,
              seatDef.rowLabel,
              seatDef.columnNumber,
              seatDef.seatType,
              seatDef.isActive !== undefined ? seatDef.isActive : true
            )
          );
        }
      }
    } else {
      // Generación por defecto en rejilla filas x columnas
      for (let r = 0; r < input.rows; r++) {
        const rowLabel = getRowLetter(r);
        for (let c = 1; c <= input.columns; c++) {
          const seatId = `seat-${hallId}-${rowLabel}${c}`;
          // Asignar tipo VIP a la última fila si la proyección es VIP
          let seatType: SeatType = 'STANDARD';
          if (input.projectionType === 'VIP') {
            seatType = 'VIP';
          } else if (r === 0 && (c === 1 || c === input.columns)) {
            // Butacas accesibles en esquinas delanteras
            seatType = 'ACCESSIBLE';
          }

          seatsToCreate.push(new Seat(seatId, hallId, rowLabel, c, seatType, true));
        }
      }
    }

    const totalCapacity = seatsToCreate.filter(s => s.isActive && s.seatType !== 'EMPTY').length;

    const newHall = new CinemaHall(
      hallId,
      input.complexId,
      input.name.trim(),
      input.projectionType,
      totalCapacity,
      true
    );

    return await this.hallRepository.createHallWithSeats(newHall, seatsToCreate);
  }
}
