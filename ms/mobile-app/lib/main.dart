import 'package:flutter/material.dart';
import 'core/crypto/crypto_qr_verifier.dart';
import 'core/database/local_seeder.dart';
import 'core/database/sqlite_wallet_db.dart';
import 'core/network/api_health_service.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/login_view.dart';
import 'features/customer_navigation/presentation/customer_bottom_nav_layout.dart';
import 'features/gatekeeper/presentation/camera_scanner_view.dart';
import 'shared/router/role_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final database = SqliteWalletDb();
  final verifier = CryptoQrVerifier();
  final healthService = ApiHealthService();

  // Precargar boletos locales de prueba si la base de datos está vacía
  try {
    final seeder = LocalSeeder(database);
    await seeder.seedIfEmpty();
  } catch (_) {
    // Si corre en un entorno sin soporte sqlite nativo inmediato, continúa fluidamente
  }

  runApp(CineCenterApp(
    database: database,
    verifier: verifier,
    healthService: healthService,
  ));
}

/// Aplicación principal Cine Center Mobile (ms/mobile-app)
class CineCenterApp extends StatelessWidget {
  final SqliteWalletDb database;
  final CryptoQrVerifier verifier;
  final ApiHealthService healthService;
  final Widget? home;

  const CineCenterApp({
    super.key,
    required this.database,
    required this.verifier,
    required this.healthService,
    this.home,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cine Center Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: home ??
          LoginView(
            healthService: healthService,
            onLoginSuccess: (role, email) {
              if (role == RoleConstants.gatekeeper) {
                Navigator.of(context).pushReplacementNamed(AppRoutes.gatekeeperScanner);
              } else {
                Navigator.of(context).pushReplacementNamed(AppRoutes.customerHome);
              }
            },
          ),
      onGenerateRoute: (settings) {
        if (settings.name == AppRoutes.customerHome) {
          return MaterialPageRoute(
            builder: (_) => CustomerBottomNavLayout(
              database: database,
              customerEmail: 'cliente@test.com',
            ),
          );
        }
        if (settings.name == AppRoutes.gatekeeperScanner) {
          return MaterialPageRoute(
            builder: (_) => CameraScannerView(
              database: database,
              verifier: verifier,
              roomName: 'Sala 1 (IMAX)',
            ),
          );
        }
        return null;
      },
    );
  }
}
