import { AdminLayoutComponent } from './admin-layout.component';
import { AuthTokenGuard } from '../core/guards/auth-token.guard';
import { HealthBadgeComponent } from '../shared/components/health-badge.component';
import { ToastContainerComponent } from '../shared/components/toast-container.component';

describe('T2.1 [IMPL] AdminLayoutComponent & Navigation Guards', () => {
  it('debe contener los 6 accesos maestros de gestión en el sidebar permanente', () => {
    const layout = new AdminLayoutComponent();
    expect(layout.navigationItems.length).toBe(6);

    const labels = layout.navigationItems.map((n) => n.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Salas & Aforos');
    expect(labels).toContain('Películas & Pósters');
    expect(labels).toContain('Programación Semanal');
    expect(labels).toContain('Reportes IA (MCP)');
    expect(labels).toContain('POS Confitería');
  });

  it('debe tener configurado el botón "Volver al Portal Público" hacia http://localhost:3000', () => {
    const layout = new AdminLayoutComponent();
    expect(layout.publicPortalUrl).toBe('http://localhost:3000');
  });

  it('debe capturar y almacenar tokens JWT redirigidos con AuthTokenGuard', () => {
    const queryParams = { auth_token: 'fake-jwt-token-admin' };
    const result = AuthTokenGuard.handleAuthToken(queryParams);
    expect(result).toBe(true);
  });

  it('debe renderizar el badge de salud en verde cuando el backend está activo', () => {
    const badge = new HealthBadgeComponent();
    expect(badge.isHealthy).toBe(true);
    expect(badge.statusText).toContain('ACTIVO');
    expect(badge.badgeCssClass).toContain('emerald');

    badge.updateStatus(false);
    expect(badge.isHealthy).toBe(false);
    expect(badge.statusText).toBe('OFFLINE');
    expect(badge.badgeCssClass).toContain('rose');
  });

  it('debe emitir y eliminar notificaciones en ToastContainerComponent', () => {
    const toastContainer = new ToastContainerComponent();
    toastContainer.show('success', 'Éxito', 'Operación completada');
    expect(toastContainer.toasts.length).toBe(1);
    expect(toastContainer.toasts[0].title).toBe('Éxito');

    toastContainer.remove(toastContainer.toasts[0].id);
    expect(toastContainer.toasts.length).toBe(0);
  });
});
