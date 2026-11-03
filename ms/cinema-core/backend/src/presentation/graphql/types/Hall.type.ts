export interface HallGraphQLType {
  id: string;
  complexId: string;
  name: string;
  projectionType: '2D' | '3D' | 'CXC' | 'VIP' | 'IMAX';
  totalCapacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  seats?: SeatGraphQLType[];
}

export interface SeatGraphQLType {
  id: string;
  hallId: string;
  rowLabel: string;
  columnNumber: number;
  seatType: 'STANDARD' | 'VIP' | 'ACCESSIBLE' | 'EMPTY';
  isActive: boolean;
  code: string;
}

export interface CreateSeatGraphQLInput {
  rowLabel: string;
  columnNumber: number;
  seatType: 'STANDARD' | 'VIP' | 'ACCESSIBLE' | 'EMPTY';
  isActive?: boolean;
}

export interface CreateHallGraphQLInput {
  complexId: string;
  name: string;
  projectionType: '2D' | '3D' | 'CXC' | 'VIP' | 'IMAX';
  rows: number;
  columns: number;
  customSeats?: CreateSeatGraphQLInput[];
}
