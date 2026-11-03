import { CreateHallModalComponent, NewHallData } from './create-hall-modal.component';

describe('CreateHallModalComponent & Matrix Editor (T3.2 / T3.3)', () => {
  let component: CreateHallModalComponent;

  beforeEach(() => {
    component = new CreateHallModalComponent();
  });

  it('debe inicializar con cuadrícula por defecto de 6 filas y 10 columnas (60 celdas)', () => {
    expect(component.rows).toBe(6);
    expect(component.columns).toBe(10);
    expect(component.seats.length).toBe(60);
    expect(component.activeSeatsCount).toBe(60);
  });

  it('debe regenerar la cuadrícula cuando se modifican filas y columnas', () => {
    component.rows = 4;
    component.columns = 5;
    component.regenerateGrid();

    expect(component.seats.length).toBe(20);
    expect(component.rowList).toEqual(['A', 'B', 'C', 'D']);
    expect(component.columnList).toEqual([1, 2, 3, 4, 5]);
  });

  it('debe ciclar los tipos de asiento al hacer clic: STANDARD -> VIP -> ACCESSIBLE -> EMPTY -> STANDARD', () => {
    component.rows = 2;
    component.columns = 2;
    component.regenerateGrid();

    // Tomar el asiento B1
    const seat = component.seats.find(s => s.rowLabel === 'B' && s.columnNumber === 1);
    expect(seat).toBeDefined();
    expect(seat?.seatType).toBe('STANDARD');

    // 1 clic -> VIP
    component.cycleSeatType(seat!);
    expect(seat?.seatType).toBe('VIP');

    // 2 clics -> ACCESSIBLE
    component.cycleSeatType(seat!);
    expect(seat?.seatType).toBe('ACCESSIBLE');

    // 3 clics -> EMPTY (pasillo)
    component.cycleSeatType(seat!);
    expect(seat?.seatType).toBe('EMPTY');
    // Al ser EMPTY, la capacidad activa debe disminuir en 1 (de 4 a 3)
    expect(component.activeSeatsCount).toBe(3);

    // 4 clics -> STANDARD
    component.cycleSeatType(seat!);
    expect(seat?.seatType).toBe('STANDARD');
    expect(component.activeSeatsCount).toBe(4);
  });

  it('debe mostrar error si se intenta guardar sin nombre de sala', () => {
    component.name = '';
    component.onSave();

    expect(component.errorMessage).toBe('Debe indicar un nombre para la sala.');
  });

  it('debe emitir save con la matriz completa cuando los datos son válidos', () => {
    let emittedData: NewHallData | undefined;
    component.save.subscribe((data: NewHallData) => {
      emittedData = data;
    });

    component.name = 'Sala IMAX Principal';
    component.projectionType = 'IMAX';
    component.rows = 3;
    component.columns = 4;
    component.regenerateGrid();

    component.onSave();

    expect(emittedData).toBeDefined();
    expect(emittedData?.name).toBe('Sala IMAX Principal');
    expect(emittedData?.projectionType).toBe('IMAX');
    expect(emittedData?.totalCapacity).toBe(12);
    expect(emittedData?.seats.length).toBe(12);
  });
});
