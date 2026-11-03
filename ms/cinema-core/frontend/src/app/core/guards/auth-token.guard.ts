export class AuthTokenGuard {
  public static readonly STORAGE_KEY = 'cinema_admin_jwt_token';

  public static handleAuthToken(queryParams: Record<string, string>): boolean {
    const token = queryParams['auth_token'];
    if (token) {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(AuthTokenGuard.STORAGE_KEY, token);
      }
      return true;
    }

    // Si ya existe en sessionStorage, está autenticado
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return !!window.sessionStorage.getItem(AuthTokenGuard.STORAGE_KEY);
    }

    return true; // En modo demo local permitimos acceso
  }

  public static getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(AuthTokenGuard.STORAGE_KEY);
    }
    return null;
  }
}
