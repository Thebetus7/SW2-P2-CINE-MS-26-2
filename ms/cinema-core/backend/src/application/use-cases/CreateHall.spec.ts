import { CreateHallUseCase, InMemoryCinemaHallRepository } from './CreateHall.usecase';
import { HallResolver } from '../../presentation/graphql/resolvers/Hall.resolver';

describe('CreateHallUseCase & HallResolver (T3.1 / T3.3)', () => {
  let repository: InMemoryCinemaHallRepository;
  let useCase: CreateHallUseCase;
  let resolver: HallResolver;

  beforeEach(() => {
    repository = new InMemoryCinemaHallRepository();
    useCase = new CreateHallUseCase(repository);
    resolver = new HallResolver(repository);
  });

  it('debe crear una sala con cuadrícula estándar y generar todas las butacas', async () => {
    const input = {
      complexId: 'complex-central-01',
      name: 'Sala 5 MacroXE',
      projectionType: '2D' as const,
      rows: 5,
      columns: 8,
    };

    const result = await useCase.execute(input);

    expect(result.hall.id).toBeDefined();
    expect(result.hall.name).toBe('Sala 5 MacroXE');
    expect(result.hall.totalCapacity).toBe(40); // 5 x 8
    expect(result.seats.length).toBe(40);

    // Verificar primera fila y esquinas accesibles
    const seatA1 = result.seats.find(s => s.rowLabel === 'A' && s.columnNumber === 1);
    expect(seatA1).toBeDefined();
    expect(seatA1?.seatType).toBe('ACCESSIBLE');

    const seatB3 = result.seats.find(s => s.rowLabel === 'B' && s.columnNumber === 3);
    expect(seatB3?.seatType).toBe('STANDARD');
    expect(seatB3?.code).toBe('B3');
  });

  it('debe generar butacas VIP cuando la proyección es VIP', async () => {
    const input = {
      complexId: 'complex-central-01',
      name: 'Sala VIP Platinum',
      projectionType: 'VIP' as const,
      rows: 3,
      columns: 6,
    };

    const result = await useCase.execute(input);

    expect(result.hall.totalCapacity).toBe(18);
    expect(result.seats.every(s => s.seatType === 'VIP')).toBe(true);
  });

  it('debe respetar una matriz interactiva con butacas eliminadas (pasillos EMPTY)', async () => {
    const input = {
      complexId: 'complex-central-01',
      name: 'Sala Con Pasillo Central',
      projectionType: '3D' as const,
      rows: 2,
      columns: 4,
      customSeats: [
        { rowLabel: 'A', columnNumber: 1, seatType: 'STANDARD' as const },
        { rowLabel: 'A', columnNumber: 2, seatType: 'EMPTY' as const }, // Pasillo
        { rowLabel: 'A', columnNumber: 3, seatType: 'EMPTY' as const }, // Pasillo
        { rowLabel: 'A', columnNumber: 4, seatType: 'STANDARD' as const },
        { rowLabel: 'B', columnNumber: 1, seatType: 'VIP' as const },
        { rowLabel: 'B', columnNumber: 2, seatType: 'VIP' as const },
        { rowLabel: 'B', columnNumber: 3, seatType: 'VIP' as const },
        { rowLabel: 'B', columnNumber: 4, seatType: 'VIP' as const },
      ],
    };

    const result = await useCase.execute(input);

    // 8 celdas, 2 de pasillo (EMPTY) -> 6 butacas reales persistidas
    expect(result.hall.totalCapacity).toBe(6);
    expect(result.seats.length).toBe(6);
    expect(result.seats.some(s => s.seatType === 'EMPTY')).toBe(false);
  });

  it('debe rechazar datos inválidos con mensajes de error claros', async () => {
    await expect(
      useCase.execute({
        complexId: '',
        name: 'Sala Inválida',
        projectionType: '2D',
        rows: 5,
        columns: 5,
      })
    ).rejects.toThrow('El ID del complejo es obligatorio.');

    await expect(
      useCase.execute({
        complexId: 'c1',
        name: '',
        projectionType: '2D',
        rows: 5,
        columns: 5,
      })
    ).rejects.toThrow('El nombre de la sala es obligatorio.');

    await expect(
      useCase.execute({
        complexId: 'c1',
        name: 'Sala 1',
        projectionType: '2D',
        rows: 0,
        columns: 5,
      })
    ).rejects.toThrow('El número de filas debe ser un valor entre 1 y 26.');
  });

  it('debe consultar salas y detalles con asientos mediante HallResolver', async () => {
    // Crear una sala a través del resolver
    const created = await resolver.createHall({
      complexId: 'complex-norte',
      name: 'Sala 1 Norte',
      projectionType: 'CXC',
      rows: 2,
      columns: 2,
    });

    expect(created.id).toBeDefined();
    expect(created.totalCapacity).toBe(4);

    // Consultar lista
    const halls = await resolver.getHalls('complex-norte');
    expect(halls.length).toBe(1);
    expect(halls[0].name).toBe('Sala 1 Norte');

    // Consultar detalles con asientos
    const details = await resolver.getHallDetails(created.id);
    expect(details).not.toBeNull();
    expect(details?.seats?.length).toBe(4);
  });
});
