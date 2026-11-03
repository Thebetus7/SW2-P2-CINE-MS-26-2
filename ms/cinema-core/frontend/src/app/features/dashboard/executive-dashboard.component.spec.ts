import { ExecutiveDashboardComponent } from './executive-dashboard.component';
import { HealthController } from '../../../../../backend/src/presentation/controllers/Health.controller';

describe('T2.2 [IMPL] ExecutiveDashboardComponent & HealthController', () => {
  it('debe contener las tarjetas KPI principales formateadas en bolivianos (Bs.)', () => {
    const dashboard = new ExecutiveDashboardComponent();

    expect(dashboard.metrics.consolidatedRevenueBs).toBe(64820);
    expect(dashboard.formattedRevenue).toContain('64.820');
    expect(dashboard.metrics.ticketsSold).toBe(1840);
    expect(dashboard.metrics.freeSeats).toBe(410);
    expect(dashboard.metrics.cleaningBufferOk).toBe(true);
  });

  it('debe listar el monitoreo en vivo de las 4 salas operando', () => {
    const dashboard = new ExecutiveDashboardComponent();

    expect(dashboard.hallsMonitoring.length).toBe(4);
    const hallNames = dashboard.hallsMonitoring.map((h) => h.hallName);
    expect(hallNames).toContain('Sala 1 IMAX Laser');
    expect(hallNames).toContain('Sala 4 VIP Lounge');

    // Verificar sala llena (VIP 100%)
    const vipHall = dashboard.hallsMonitoring.find((h) => h.format === 'VIP');
    expect(vipHall?.occupancyPercent).toBe(100);
    expect(vipHall?.technicalStatus).toBe('Lleno Total');
  });

  it('debe desplegar la tarjeta de recomendaciones de IA del microservicio ai-mcp', () => {
    const dashboard = new ExecutiveDashboardComponent();

    expect(dashboard.aiRecommendation.activeAlert).toBe(true);
    expect(dashboard.aiRecommendation.title).toContain('Alta Afluencia');
    expect(dashboard.aiRecommendation.suggestedAction).toContain('Habilitar 2 cajas extras');
  });

  it('debe responder UP en el controlador de salud de NestJS backend', () => {
    const healthController = new HealthController();
    const response = healthController.checkHealth();

    expect(response.status).toBe('UP');
    expect(response.service).toBe('cinema-core');
    expect(response.database).toBe('CONNECTED');
    expect(response.version).toBe('1.4.0');
  });
});
