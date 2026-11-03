import { CreateHallUseCase, ICinemaHallRepository, InMemoryCinemaHallRepository } from '../../../application/use-cases/CreateHall.usecase';
import { CreateHallGraphQLInput, HallGraphQLType } from '../types/Hall.type';

export class HallResolver {
  private createHallUseCase: CreateHallUseCase;

  constructor(private readonly hallRepository: ICinemaHallRepository = new InMemoryCinemaHallRepository()) {
    this.createHallUseCase = new CreateHallUseCase(this.hallRepository);
  }

  async getHalls(complexId: string): Promise<HallGraphQLType[]> {
    const halls = await this.hallRepository.findHallsByComplex(complexId);
    return halls.map(h => ({
      id: h.id,
      complexId: h.complexId,
      name: h.name,
      projectionType: h.projectionType,
      totalCapacity: h.totalCapacity,
      isActive: h.isActive,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    }));
  }

  async getHallDetails(hallId: string): Promise<HallGraphQLType | null> {
    const hall = await this.hallRepository.findHallById(hallId);
    if (!hall) return null;

    const seats = await this.hallRepository.findSeatsByHall(hallId);
    return {
      id: hall.id,
      complexId: hall.complexId,
      name: hall.name,
      projectionType: hall.projectionType,
      totalCapacity: hall.totalCapacity,
      isActive: hall.isActive,
      createdAt: hall.createdAt.toISOString(),
      updatedAt: hall.updatedAt.toISOString(),
      seats: seats.map(s => ({
        id: s.id,
        hallId: s.hallId,
        rowLabel: s.rowLabel,
        columnNumber: s.columnNumber,
        seatType: s.seatType,
        isActive: s.isActive,
        code: s.code,
      })),
    };
  }

  async createHall(input: CreateHallGraphQLInput): Promise<HallGraphQLType> {
    const result = await this.createHallUseCase.execute({
      complexId: input.complexId,
      name: input.name,
      projectionType: input.projectionType,
      rows: input.rows,
      columns: input.columns,
      customSeats: input.customSeats,
    });

    return {
      id: result.hall.id,
      complexId: result.hall.complexId,
      name: result.hall.name,
      projectionType: result.hall.projectionType,
      totalCapacity: result.hall.totalCapacity,
      isActive: result.hall.isActive,
      createdAt: result.hall.createdAt.toISOString(),
      updatedAt: result.hall.updatedAt.toISOString(),
      seats: result.seats.map(s => ({
        id: s.id,
        hallId: s.hallId,
        rowLabel: s.rowLabel,
        columnNumber: s.columnNumber,
        seatType: s.seatType,
        isActive: s.isActive,
        code: s.code,
      })),
    };
  }
}
