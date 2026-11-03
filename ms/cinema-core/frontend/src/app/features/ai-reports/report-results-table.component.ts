import { SimpleEventEmitter } from '../halls/create-hall-modal.component';

export interface ReportRowData {
  id: string;
  period: string;
  complexName: string;
  hallName: string;
  movieTitle: string;
  ticketsSold: number;
  ticketRevenueBs: number;
  candyRevenueBs: number;
  totalRevenueBs: number;
  occupancyPercent: number;
}

export class ReportResultsTableComponent {
  public rows: ReportRowData[] = [
    {
      id: 'rep-01',
      period: 'Octubre 2026',
      complexName: 'Cine Center Central (La Paz)',
      hallName: 'Sala 1 IMAX Laser',
      movieTitle: 'Dune: Part Two',
      ticketsSold: 940,
      ticketRevenueBs: 42300,
      candyRevenueBs: 21500,
      totalRevenueBs: 63800,
      occupancyPercent: 94.5,
    },
    {
      id: 'rep-02',
      period: 'Octubre 2026',
      complexName: 'Cine Center Central (La Paz)',
      hallName: 'Sala 2 CXC Extreme',
      movieTitle: 'Gladiator II',
      ticketsSold: 610,
      ticketRevenueBs: 27450,
      candyRevenueBs: 13200,
      totalRevenueBs: 40650,
      occupancyPercent: 88.0,
    },
    {
      id: 'rep-03',
      period: 'Octubre 2026',
      complexName: 'Cine Center Norte (Santa Cruz)',
      hallName: 'Sala VIP Platinum',
      movieTitle: 'Moana 2',
      ticketsSold: 420,
      ticketRevenueBs: 25200,
      candyRevenueBs: 16800,
      totalRevenueBs: 42000,
      occupancyPercent: 91.2,
    },
  ];

  public downloadExcelRequested = new SimpleEventEmitter<ReportRowData[]>();

  get totalConsolidatedBs(): number {
    return this.rows.reduce((acc, r) => acc + r.totalRevenueBs, 0);
  }

  get totalTicketsSold(): number {
    return this.rows.reduce((acc, r) => acc + r.ticketsSold, 0);
  }

  get averageOccupancy(): number {
    if (this.rows.length === 0) return 0;
    const sum = this.rows.reduce((acc, r) => acc + r.occupancyPercent, 0);
    return Math.round((sum / this.rows.length) * 10) / 10;
  }

  triggerExcelDownload(): { filename: string; rowCount: number; success: boolean } {
    this.downloadExcelRequested.emit(this.rows);
    return {
      filename: `reporte_consolidado_cinecenter_${new Date().toISOString().substring(0, 10)}.xlsx`,
      rowCount: this.rows.length,
      success: true,
    };
  }
}
