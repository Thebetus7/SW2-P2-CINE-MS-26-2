import { SimpleEventEmitter } from '../halls/create-hall-modal.component';

export interface ReportFilterCriteria {
  dateFrom: string;
  dateTo: string;
  complexId: string;
  format: string; // 'ALL' | '2D' | '3D' | 'IMAX' | 'CXC' | 'VIP'
  reportType: 'revenue' | 'occupancy' | 'candy' | 'ai_prediction';
}

export class ReportsFilterBarComponent {
  public criteria: ReportFilterCriteria = {
    dateFrom: '2026-10-01',
    dateTo: '2026-10-20',
    complexId: 'ALL',
    format: 'ALL',
    reportType: 'revenue',
  };

  public filterChanged = new SimpleEventEmitter<ReportFilterCriteria>();

  public applyFilters(): void {
    this.filterChanged.emit({ ...this.criteria });
  }

  public setReportType(type: 'revenue' | 'occupancy' | 'candy' | 'ai_prediction'): void {
    this.criteria.reportType = type;
    this.applyFilters();
  }
}
