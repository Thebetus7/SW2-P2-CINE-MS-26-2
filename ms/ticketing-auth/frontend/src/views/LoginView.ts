export type UserRole = 'ROLE_CLIENT' | 'ROLE_ADMIN' | 'ROLE_CASHIER';

export interface AuthSession {
  token: string;
  email: string;
  role: UserRole;
  redirectUrl: string;
}

export class LoginViewModel {
  /**
   * INV-BIZ-05: Redirección inteligente y bifurcación según el rol del usuario autenticado.
   */
  static authenticate(email: string, password: string): AuthSession {
    if (password !== 'Password123!') {
      throw new Error('Credenciales inválidas. Compruebe su contraseña.');
    }

    let role: UserRole = 'ROLE_CLIENT';
    let redirectUrl = '/cartelera';

    if (email.includes('admin')) {
      role = 'ROLE_ADMIN';
      redirectUrl = 'http://localhost:4200/admin'; // Frontend Angular ERP
    } else if (email.includes('cajero') || email.includes('cashier')) {
      role = 'ROLE_CASHIER';
      redirectUrl = 'http://localhost:8080/pos/candy-scan'; // Terminal POS Laravel
    } else {
      role = 'ROLE_CLIENT';
      redirectUrl = '/cartelera'; // Portal de cliente autenticado
    }

    return {
      token: `jwt_token_${role.toLowerCase()}_${Date.now()}`,
      email,
      role,
      redirectUrl,
    };
  }

  static getRedirectionPath(role: UserRole): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'http://localhost:4200/admin';
      case 'ROLE_CASHIER':
        return 'http://localhost:8080/pos/candy-scan';
      case 'ROLE_CLIENT':
      default:
        return '/cartelera';
    }
  }
}
