import { CinemaHall } from '../src/domain/entities/CinemaHall.entity';
import { CreateHallUseCase, InMemoryCinemaHallRepository } from '../src/application/use-cases/CreateHall.usecase';

describe('CinemaHall and HallUseCases Unit Tests (RB-07.2, SC-02)', () => {
  let hallRepository: InMemoryCinemaHallRepository;
  let createHallUseCase: CreateHallUseCase;

  beforeEach(() => {
    hallRepository = new InMemoryCinemaHallRepository();
    createHallUseCase = new CreateHallUseCase(hallRepository);
  });

  it('debe crear exitosamente una sala con su matriz de butacas estándar y accesibles', async () => {
    const result = await createHallUseCase.execute({
      complexId: 'complex-lpz-01',
      name: 'Sala 3 Dolby Atmos',
      projectionType: 'IMAX',
      rows: 10,
      columns: 15,
    });

    expect(result.hall).toBeDefined();
    expect(result.hall.name).toBe('Sala 3 Dolby Atmos');
    expect(result.hall.projectionType).toBe('IMAX');
    expect(result.hall.totalCapacity).toBe(150);
    expect(result.seats.length).toBe(150);
    expect(result.hall.isActive).toBe(true);

    // Verificar butacas accesibles en la primera fila (esquinas)
    const accessibleSeats = result.seats.filter(s => s.seatType === 'ACCESSIBLE');
    expect(accessibleSeats.length).toBe(2);
  });

  it('debe crear asientos VIP si la sala es de tipo VIP', async () => {
    const result = await createHallUseCase.execute({
      complexId: 'complex-scz-01',
      name: 'Sala VIP Platinum',
      projectionType: 'VIP',
      rows: 6,
      columns: 10,
    });

    expect(result.hall.totalCapacity).toBe(60);
    const vipSeats = result.seats.filter(s => s.seatType === 'VIP');
    expect(vipSeats.length).toBe(60);
  });

  it('debe rechazar nombres vacíos o IDs de complejo faltantes', async () => {
    await expect(
      createHallUseCase.execute({
        complexId: '',
        name: 'Sala 1',
        projectionType: '2D',
        rows: 8,
        columns: 10,
      })
    ).rejects.toThrow('El ID del complejo es obligatorio.');

    await expect(
      createHallUseCase.execute({
        complexId: 'complex-01',
        name: '',
        projectionType: '2D',
        rows: 8,
        columns: 10,
      })
    ).rejects.toThrow('El nombre de la sala es obligatorio.');
  });

  it('debe validar límites de filas y columnas (1-26 filas, 1-30 columnas)', async () => {
    await expect(
      createHallUseCase.execute({
        complexId: 'complex-01',
        name: 'Sala Exceso',
        projectionType: '2D',
        rows: 0,
        columns: 10,
      })
    ).rejects.toThrow('El número de filas debe ser un valor entre 1 y 26.');

    await expect(
      createHallUseCase.execute({
        complexId: 'complex-01',
        name: 'Sala Columnas Exceso',
        projectionType: '2D',
        rows: 10,
        columns: 35,
      })
    ).rejects.toThrow('El número de columnas debe ser un valor entre 1 y 30.');
  });
});
