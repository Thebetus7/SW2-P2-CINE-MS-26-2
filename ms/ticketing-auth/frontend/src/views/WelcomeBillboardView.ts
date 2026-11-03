export interface MovieBillboardItem {
  id: string;
  title: string;
  synopsis: string;
  durationMinutes: number;
  rating: string;
  genre: string;
  format: 'IMAX 3D' | '2D' | 'MacroXE';
  posterUrl: string;
  showtimes: Array<{ id: string; time: string; hallName: string; priceCents: number }>;
}

export interface MicroserviceHealth {
  cinemaCore: 'UP' | 'DOWN';
  mediaHub: 'UP' | 'DOWN';
  ticketingAuth: 'UP' | 'DOWN';
  aiMcp: 'UP' | 'DOWN';
}

export class WelcomeBillboardModel {
  static getSampleMovies(): MovieBillboardItem[] {
    return [
      {
        id: 'mov-01',
        title: 'Dune: Part Two',
        synopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores.',
        durationMinutes: 166,
        rating: 'PG-13',
        genre: 'Sci-Fi / Aventura',
        format: 'IMAX 3D',
        posterUrl: '/assets/posters/dune2.jpg',
        showtimes: [
          { id: 'shw-101', time: '16:00', hallName: 'Sala 1 - IMAX', priceCents: 4500 },
          { id: 'shw-102', time: '19:30', hallName: 'Sala 1 - IMAX', priceCents: 4500 },
          { id: 'shw-103', time: '22:15', hallName: 'Sala 2 - MacroXE', priceCents: 3500 },
        ],
      },
      {
        id: 'mov-02',
        title: 'Gladiator II',
        synopsis: 'Años después de presenciar la muerte de Máximo, Lucio debe ingresar al Coliseo.',
        durationMinutes: 148,
        rating: 'R',
        genre: 'Acción / Drama',
        format: 'MacroXE',
        posterUrl: '/assets/posters/gladiator2.jpg',
        showtimes: [
          { id: 'shw-201', time: '17:00', hallName: 'Sala 2 - MacroXE', priceCents: 3500 },
          { id: 'shw-202', time: '20:45', hallName: 'Sala 2 - MacroXE', priceCents: 3500 },
        ],
      },
    ];
  }

  static getSystemHealth(): MicroserviceHealth {
    return {
      cinemaCore: 'UP',     // Puerto 3002
      mediaHub: 'UP',       // Puerto 8080
      ticketingAuth: 'UP',  // Puerto 8082
      aiMcp: 'UP',          // Puerto 8001
    };
  }
}
