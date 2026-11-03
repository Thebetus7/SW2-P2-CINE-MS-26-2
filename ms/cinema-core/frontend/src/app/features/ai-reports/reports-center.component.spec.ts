import { ReportsCenterComponent } from './reports-center.component';

describe('ReportsCenterComponent, Voice Assistant & Excel (.xlsx) Download (T6.1 / T6.2 / T6.3)', () => {
  let reportsCenter: ReportsCenterComponent;

  beforeEach(() => {
    reportsCenter = new ReportsCenterComponent();
  });

  it('debe tener las 4 tarjetas de 1-clic operativas y listas para su selección', () => {
    expect(reportsCenter.oneClickCards.length).toBe(4);

    const titles = reportsCenter.oneClickCards.map(c => c.title);
    expect(titles).toContain('Recaudación por Complejo');
    expect(titles).toContain('Ocupación & Horarios Pico');
    expect(titles).toContain('Confitería vs. Boletos');
    expect(titles).toContain('Predicción IA de Demanda');
  });

  it('debe actualizar los filtros y el título al seleccionar una tarjeta de 1-clic', () => {
    const candyCard = reportsCenter.oneClickCards.find(c => c.type === 'candy')!;
    reportsCenter.selectOneClickCard(candyCard);

    expect(reportsCenter.currentReportTitle).toBe('Confitería vs. Boletos');
    expect(reportsCenter.filterBar.criteria.reportType).toBe('candy');
    expect(reportsCenter.aiAssistantMessage).toContain('Confitería vs. Boletos');
  });

  it('debe procesar comandos de voz y mapearlos a la acción correspondiente', () => {
    // Comando oral de ocupación
    const actionOcc = reportsCenter.processVoiceCommand('Generar reporte de ocupación de salas');
    expect(actionOcc).toBe('OCCUPANCY_REPORT');
    expect(reportsCenter.currentReportTitle).toBe('Ocupación & Horarios Pico');

    // Comando oral de descarga Excel
    let downloadedPayload: any;
    reportsCenter.resultsTable.downloadExcelRequested.subscribe(data => {
      downloadedPayload = data;
    });

    const actionDownload = reportsCenter.processVoiceCommand('Por favor descargar excel con las ventas');
    expect(actionDownload).toBe('EXCEL_DOWNLOAD');
    expect(reportsCenter.aiAssistantMessage).toContain('.xlsx');
    expect(downloadedPayload).toBeDefined();
    expect(downloadedPayload.length).toBe(3);
  });

  it('debe calcular métricas consolidadas (Bs. totales y ocupación promedio)', () => {
    const table = reportsCenter.resultsTable;

    // 63800 + 40650 + 42000 = 146450 Bs.
    expect(table.totalConsolidatedBs).toBe(146450);

    // 940 + 610 + 420 = 1970 boletos
    expect(table.totalTicketsSold).toBe(1970);

    // Promedio de ocupación: (94.5 + 88.0 + 91.2) / 3 = 91.2%
    expect(table.averageOccupancy).toBe(91.2);
  });

  it('debe gatillar la descarga directa de libro .xlsx con nombre fechado', () => {
    const downloadResult = reportsCenter.resultsTable.triggerExcelDownload();

    expect(downloadResult.success).toBe(true);
    expect(downloadResult.filename).toContain('reporte_consolidado_cinecenter_');
    expect(downloadResult.filename).toContain('.xlsx');
    expect(downloadResult.rowCount).toBe(3);
  });
});
