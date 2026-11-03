export class HealthBadgeComponent {
  public isHealthy: boolean = true;
  public latencyMs: number = 4;
  public serviceName: string = 'NestJS GraphQL';

  public updateStatus(healthy: boolean, latency: number = 4): void {
    this.isHealthy = healthy;
    this.latencyMs = latency;
  }

  get statusText(): string {
    return this.isHealthy ? `ACTIVO (${this.latencyMs}MS)` : 'OFFLINE';
  }

  get badgeCssClass(): string {
    return this.isHealthy
      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
      : 'bg-rose-950/60 text-rose-400 border border-rose-800/50';
  }
}
