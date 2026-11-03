import { CinemaDatabaseSeeder } from './CinemaDatabaseSeeder';

describe('T1.3 [SETUP] CinemaDatabaseSeeder', () => {
  it('debe generar el dataset demostrativo completo para el complejo y cartelera', () => {
    const data = CinemaDatabaseSeeder.generateDemoData();

    expect(data.complexes.length).toBeGreaterThanOrEqual(2);
    expect(data.complexes.some((c) => c.name === 'Multiplex Centro')).toBe(true);

    expect(data.halls.length).toBeGreaterThanOrEqual(4);
    expect(data.halls.some((h) => h.projectionType === 'IMAX')).toBe(true);

    // Debe generar las 84 butacas para la sala VIP
    expect(data.seats.length).toBe(84);
    expect(data.seats.some((s) => s.seatType === 'ACCESSIBLE')).toBe(true);

    // Películas
    expect(data.movies.length).toBeGreaterThanOrEqual(3);
    expect(data.movies.some((m) => m.title === 'Gladiator II')).toBe(true);

    // Funciones
    expect(data.showtimes.length).toBeGreaterThanOrEqual(2);
    expect(data.showtimes[0].priceCents).toBeGreaterThan(0);
  });
});
