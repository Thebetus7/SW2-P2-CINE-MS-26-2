export interface HallLiveMonitoring {
  hallName: string;
  format: string;
  currentMovie: string;
  timeWindow: string;
  occupancyPercent: number;
  totalSeats: number;
  occupiedSeats: number;
  technicalStatus: 'Proyectando OK' | 'Acceso Sala' | 'Limpieza Turno' | 'Lleno Total';
}

export interface KpiMetrics {
  consolidatedRevenueBs: number;
  ticketsSold: number;
  freeSeats: number;
  candyBarRevenueBs: number;
  scheduledShowtimes: number;
  cleaningBufferOk: boolean;
}

export class ExecutiveDashboardComponent {
  public metrics: KpiMetrics = {
    consolidatedRevenueBs: 64820,
    ticketsSold: 1840,
    freeSeats: 410,
    candyBarRevenueBs: 31450,
    scheduledShowtimes: 32,
    cleaningBufferOk: true
  };

  public hallsMonitoring: HallLiveMonitoring[] = [
    {
      hallName: 'Sala 1 IMAX Laser',
      format: 'IMAX',
      currentMovie: 'Dune: Part Two (3D HFR)',
      timeWindow: '19:30 — 22:15',
      occupancyPercent: 96,
      totalSeats: 380,
      occupiedSeats: 365,
      technicalStatus: 'Proyectando OK'
    },
    {
      hallName: 'Sala 2 CXC Extreme',
      format: 'CXC',
      currentMovie: 'Gladiator II (4K Laser)',
      timeWindow: '20:15 — 22:45',
      occupancyPercent: 88,
      totalSeats: 290,
      occupiedSeats: 255,
      technicalStatus: 'Acceso Sala'
    },
    {
      hallName: 'Sala 3 RealD 3D',
      format: '3D',
      currentMovie: 'Inside Out 2 (Familiar)',
      timeWindow: '18:00 — 19:40',
      occupancyPercent: 72,
      totalSeats: 210,
      occupiedSeats: 151,
      technicalStatus: 'Limpieza Turno'
    },
    {
      hallName: 'Sala 4 VIP Lounge',
      format: 'VIP',
      currentMovie: 'Joker: Folie à Deux',
      timeWindow: '19:15 — 21:35',
      occupancyPercent: 100,
      totalSeats: 84,
      occupiedSeats: 84,
      technicalStatus: 'Lleno Total'
    }
  ];

  public aiRecommendation = {
    activeAlert: true,
    title: 'Alta Afluencia Proyectada (21:00 hrs)',
    description: 'El modelo predictivo ai-mcp v2.4 prevé saturación del 94% en el vestíbulo por doble estreno.',
    suggestedAction: 'Habilitar 2 cajas extras en Candy Bar (POS #05 y #06)'
  };

  get formattedRevenue(): string {
    return `BS. ${this.metrics.consolidatedRevenueBs.toLocaleString('es-BO')}`;
  }

  get formattedCandyRevenue(): string {
    return `BS. ${this.metrics.candyBarRevenueBs.toLocaleString('es-BO')}`;
  }
}
