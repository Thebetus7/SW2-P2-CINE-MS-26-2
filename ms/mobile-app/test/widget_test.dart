import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/network/api_health_service.dart';
import 'package:mobile_app/core/theme/app_theme.dart';
import 'package:mobile_app/features/auth/presentation/login_view.dart';

void main() {
  testWidgets('CineCenterApp smoke test starts at login view', (WidgetTester tester) async {
    final healthService = ApiHealthService(
      enablePolling: false,
      autoCheck: false,
      initialState: ApiHealthState.online,
    );

    await tester.pumpWidget(MaterialApp(
      theme: AppTheme.darkTheme,
      home: LoginView(healthService: healthService),
    ));
    await tester.pump();

    // Verificar que arranca en LoginView con campos de correo y botón de inicio
    expect(find.text('Cine Center'), findsOneWidget);
    expect(find.text('Acceso a Cine Center Mobile'), findsOneWidget);
    expect(find.text('Iniciar Sesión'), findsOneWidget);

    healthService.dispose();
  });
}
