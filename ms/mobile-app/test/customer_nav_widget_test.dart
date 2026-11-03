import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mobile_app/core/database/migrations.dart';
import 'package:mobile_app/core/database/sqlite_wallet_db.dart';
import 'package:mobile_app/core/theme/app_theme.dart';
import 'package:mobile_app/features/customer_navigation/presentation/customer_bottom_nav_layout.dart';

void main() {
  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  });

  group('Customer Navigation Widget Tests (RF-01.1 / PLAN-08)', () {
    late Database rawDb;
    late SqliteWalletDb database;

    setUp(() async {
      rawDb = await databaseFactoryFfi.openDatabase(
        inMemoryDatabasePath,
        options: OpenDatabaseOptions(
          version: DatabaseMigrations.currentVersion,
          onCreate: DatabaseMigrations.onCreate,
        ),
      );
      database = SqliteWalletDb(rawDb);
    });

    tearDown(() async {
      await rawDb.close();
    });

    testWidgets('Renders BottomNavigationBar with exactly 4 destinations and Billboard as initial view',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: CustomerBottomNavLayout(database: database),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // 1. Verificar presencia de los 4 destinos fijos en la barra inferior
      expect(find.text('Cartelera'), findsWidgets);
      expect(find.text('Mis Boletos'), findsWidgets);
      expect(find.text('Confitería'), findsWidgets);
      expect(find.text('Configuración'), findsWidgets);

      // 2. Verificar que la vista inicial obligatoria sea la Cartelera (índice 0)
      expect(find.text('Cartelera Cine Center'), findsOneWidget);
      expect(find.text('En Cartelera Hoy'), findsOneWidget);
      expect(find.text('Dune: Parte Dos'), findsOneWidget);
    });

    testWidgets('Tapping on Confitería switches active tab to candy catalog',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: CustomerBottomNavLayout(database: database),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Tocar tab Confitería
      await tester.tap(find.text('Confitería'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Confitería Cine Center'), findsOneWidget);
      expect(find.text('Combos Populares'), findsOneWidget);
      expect(find.text('Combo Dúo Palomitas'), findsOneWidget);
    });

    testWidgets('Tapping on Configuración switches active tab to settings',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: CustomerBottomNavLayout(database: database),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Tocar tab Configuración
      await tester.tap(find.text('Configuración'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Cliente Cine Center'), findsOneWidget);
      expect(find.text('Perfil: ROLE_CUSTOMER'), findsOneWidget);
      expect(find.text('Preferencias de Interfaz'), findsOneWidget);
    });
  });
}
