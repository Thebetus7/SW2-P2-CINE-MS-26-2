import 'package:flutter/material.dart';

/// Constantes de roles oficiales del ecosistema Cine Center
class RoleConstants {
  static const String customer = 'ROLE_CUSTOMER';
  static const String gatekeeper = 'ROLE_GATEKEEPER';
  static const String admin = 'ROLE_ADMIN';
}

/// Nombres de rutas oficiales de la aplicación móvil
class AppRoutes {
  static const String login = '/login';
  static const String customerHome = '/customer';
  static const String gatekeeperScanner = '/gatekeeper';
}

/// Enrutador condicional basado en roles (Role Router Pattern)
/// Garantiza la exclusividad estricta de navegación:
/// - ROLE_GATEKEEPER ──► Redirección inmediata a cámara (/gatekeeper)
/// - ROLE_CUSTOMER   ──► Redirección al layout con Bottom Bar (/customer)
class RoleRouter {
  /// Evaluación pura de ruta según el conjunto de roles asignados al usuario
  static String evaluateRole(List<String> roles) {
    if (roles.contains(RoleConstants.gatekeeper)) {
      return AppRoutes.gatekeeperScanner;
    }
    if (roles.contains(RoleConstants.customer)) {
      return AppRoutes.customerHome;
    }
    // Por defecto clientes
    return AppRoutes.customerHome;
  }

  /// Evaluación simplificada por rol único en formato String
  static String evaluateSingleRole(String role) {
    if (role == RoleConstants.gatekeeper || role.contains('portero') || role.contains('GATEKEEPER')) {
      return AppRoutes.gatekeeperScanner;
    }
    return AppRoutes.customerHome;
  }

  /// Ejecuta la navegación física en el árbol de Flutter reemplazando la vista de login
  static void navigateByRole(BuildContext context, String role) {
    final destination = evaluateSingleRole(role);
    Navigator.of(context).pushReplacementNamed(destination);
  }
}
