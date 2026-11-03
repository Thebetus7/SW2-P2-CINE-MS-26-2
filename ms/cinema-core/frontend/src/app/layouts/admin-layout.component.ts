export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  badge?: string;
  isExternal?: boolean;
}

export class AdminLayoutComponent {
  public appTitle: string = 'CINE CENTER OPS';
  public currentComplexName: string = 'Multiplex Centro';
  public supervisorName: string = 'Admin — Supervisor General';
  public publicPortalUrl: string = 'http://localhost:3000';
  public activeRouteId: string = 'dashboard';

  public navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', route: '/admin/dashboard', icon: 'layout-dashboard' },
    { id: 'halls', label: 'Salas & Aforos', route: '/admin/halls', icon: 'grid-3x3' },
    { id: 'movies', label: 'Películas & Pósters', route: '/admin/movies', icon: 'film' },
    { id: 'schedule', label: 'Programación Semanal', route: '/admin/schedule', icon: 'calendar-days' },
    { id: 'reports', label: 'Reportes IA (MCP)', route: '/admin/reports', icon: 'brain-circuit', badge: 'IA' },
    { id: 'pos', label: 'POS Confitería', route: 'http://localhost:8080/pos/candy-scan', icon: 'shopping-bag', isExternal: true }
  ];

  public navigateTo(routeId: string): void {
    this.activeRouteId = routeId;
  }

  public returnToPublicPortal(): void {
    if (typeof window !== 'undefined') {
      window.location.href = this.publicPortalUrl;
    }
  }

  get isSystemOnline(): boolean {
    return true;
  }
}
