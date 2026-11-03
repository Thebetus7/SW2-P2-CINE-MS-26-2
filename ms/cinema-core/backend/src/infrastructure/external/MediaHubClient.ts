/**
 * MediaHubClient.ts
 * Cliente para integración física con S3/MinIO a través de Media Hub (puerto 8080)
 * Permite el HardDelete físico de archivos multimedia (afiches de películas).
 */

export interface IMediaHubClient {
  deleteAsset(assetKeyOrUrl: string): Promise<boolean>;
}

export class MediaHubClient implements IMediaHubClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = process.env.MEDIA_HUB_URL || 'http://localhost:8080') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async deleteAsset(assetKeyOrUrl: string): Promise<boolean> {
    if (!assetKeyOrUrl || assetKeyOrUrl.trim() === '') {
      return false;
    }

    try {
      // Extraer clave relativa si viene como URL completa
      let key = assetKeyOrUrl;
      if (assetKeyOrUrl.startsWith('http://') || assetKeyOrUrl.startsWith('https://')) {
        const parsed = new URL(assetKeyOrUrl);
        key = parsed.pathname.replace(/^\//, '');
      }

      const response = await fetch(`${this.baseUrl}/api/media/delete-asset?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.warn(`[MediaHubClient] Advertencia al eliminar afiche físico (${assetKeyOrUrl}):`, error);
      // Falla tolerante para no abortar el SoftDelete en base de datos
      return false;
    }
  }
}
