export interface HealthCheckResponse {
  status: 'UP' | 'DOWN';
  service: string;
  version: string;
  timestamp: string;
  database: 'CONNECTED' | 'DISCONNECTED';
  uptimeSeconds: number;
}

export class HealthController {
  private startTime = Date.now();

  public checkHealth(): HealthCheckResponse {
    return {
      status: 'UP',
      service: 'cinema-core',
      version: '1.4.0',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }
}
