import { CinemaComplex } from '../../../domain/entities/CinemaComplex.entity';
import { CinemaHall } from '../../../domain/entities/CinemaHall.entity';
import { Seat } from '../../../domain/entities/Seat.entity';
import { Movie } from '../../../domain/entities/Movie.entity';
import { Showtime } from '../../../domain/entities/Showtime.entity';

export interface SeedDataset {
  complexes: CinemaComplex[];
  halls: CinemaHall[];
  seats: Seat[];
  movies: Movie[];
  showtimes: Showtime[];
}

export class CinemaDatabaseSeeder {
  public static generateDemoData(): SeedDataset {
    // 1. Complejos
    const complex1 = new CinemaComplex(
      'c1111111-1111-1111-1111-111111111111',
      'Multiplex Centro',
      'La Paz',
      'Av. 16 de Julio #1420 (El Prado)'
    );

    const complex2 = new CinemaComplex(
      'c2222222-2222-2222-2222-222222222222',
      'Ventura Mall',
      'Santa Cruz',
      '4to Anillo y Av. San Martín'
    );

    // 2. Salas
    const hall1 = new CinemaHall(
      'h1111111-1111-1111-1111-111111111111',
      complex1.id,
      'Sala 1 IMAX Laser',
      'IMAX',
      380
    );

    const hall2 = new CinemaHall(
      'h2222222-2222-2222-2222-222222222222',
      complex1.id,
      'Sala 2 CXC Extreme',
      'CXC',
      290
    );

    const hall3 = new CinemaHall(
      'h3333333-3333-3333-3333-333333333333',
      complex1.id,
      'Sala 3 RealD 3D',
      '3D',
      210
    );

    const hall4 = new CinemaHall(
      'h4444444-4444-4444-4444-444444444444',
      complex1.id,
      'Sala 4 VIP Lounge',
      'VIP',
      84
    );

    // 3. Generación de Butacas para Sala 4 VIP (ejemplo de matriz 6 filas x 14 columnas = 84 butacas)
    const seats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (const r of rows) {
      for (let c = 1; c <= 14; c++) {
        // En los bordes marcamos accesibles, el resto VIP
        const type = (r === 'A' && (c === 1 || c === 14)) ? 'ACCESSIBLE' : 'VIP';
        seats.push(new Seat(`s-${hall4.id}-${r}${c}`, hall4.id, r, c, type));
      }
    }

    // 4. Películas de Estreno
    const movie1 = new Movie(
      'm1111111-1111-1111-1111-111111111111',
      'Gladiator II',
      'Años después de presenciar la muerte de Máximo a manos de su tío, Lucio debe entrar al Coliseo.',
      148,
      'Acción / Drama Histórico',
      'P-18',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      ['Acción', 'Épica', 'IMAX']
    );

    const movie2 = new Movie(
      'm2222222-2222-2222-2222-222222222222',
      'Dune: Part Two',
      'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores.',
      166,
      'Ciencia Ficción / Aventura',
      'P-14',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      ['Ciencia Ficción', 'IMAX 3D', 'Espacio']
    );

    const movie3 = new Movie(
      'm3333333-3333-3333-3333-333333333333',
      'Joker: Folie à Deux',
      'Arthur Fleck se encuentra institucionalizado en Arkham esperando juicio por sus crímenes.',
      138,
      'Drama / Musical',
      'P-18',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      ['Drama', 'Psicológico', 'VIP Atmos']
    );

    // 5. Funciones Programadas con Buffer de Limpieza (+20 min)
    const baseDate = new Date();
    baseDate.setUTCHours(14, 0, 0, 0); // 14:00 UTC

    const showtime1 = new Showtime(
      'sh111111-1111-1111-1111-111111111111',
      hall1.id,
      movie1.id,
      new Date(baseDate.getTime()),
      148, // Termina 16:28 (+20 min = 16:48)
      4500 // Bs. 45.00
    );

    // Próxima función a las 17:00 (respeta el buffer de 20 min)
    const nextStart = new Date(baseDate.getTime() + (148 + 32) * 60 * 1000); // 17:00 UTC
    const showtime2 = new Showtime(
      'sh222222-2222-2222-2222-222222222222',
      hall1.id,
      movie2.id,
      nextStart,
      166,
      5000 // Bs. 50.00
    );

    return {
      complexes: [complex1, complex2],
      halls: [hall1, hall2, hall3, hall4],
      seats,
      movies: [movie1, movie2, movie3],
      showtimes: [showtime1, showtime2]
    };
  }
}
