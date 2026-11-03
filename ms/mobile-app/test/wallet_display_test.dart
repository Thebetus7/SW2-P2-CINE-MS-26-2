import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mobile_app/core/database/local_seeder.dart';
import 'package:mobile_app/core/database/migrations.dart';
import 'package:mobile_app/core/database/sqlite_wallet_db.dart';
import 'package:mobile_app/core/theme/app_theme.dart';
import 'package:mobile_app/features/wallet/bloc/wallet_bloc.dart';
import 'package:mobile_app/features/wallet/bloc/wallet_event.dart';
import 'package:mobile_app/features/wallet/bloc/wallet_state.dart';
import 'package:mobile_app/features/wallet/presentation/ticket_detail_view.dart';

void main() {
  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  });

  group('Wallet Display & Offline Tickets Tests (INV-BIZ-03 / PLAN-10)', () {
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
      final seeder = LocalSeeder(database);
      await seeder.seedIfEmpty();
    });

    tearDown(() async {
      await rawDb.close();
    });

    test('WalletBloc loads customer tickets from SQLite', () async {
      final bloc = WalletBloc(database: database);
      bloc.add(const LoadCustomerTicketsEvent('cliente@test.com'));

      await expectLater(
        bloc.stream,
        emitsInOrder([
          predicate<WalletState>((s) => s is WalletLoading),
          predicate<WalletState>((s) => s is WalletLoaded && s.tickets.length == 2),
        ]),
      );

      await bloc.close();
    });

    testWidgets('TicketDetailView projects both QR Llave and QR Confitería without file downloads',
        (tester) async {
      final ticket = LocalTicket(
        ticketId: 'TCK-TEST-999',
        customerEmail: 'cliente@test.com',
        movieTitle: 'Dune: Parte Dos',
        roomName: 'Sala 1 (IMAX)',
        showtime: 'Hoy 20:30',
        seats: 'F12, F13',
        qrLlavePayload: 'CINELOCK:TCK-TEST-999:Sala 1 (IMAX):1800000000:dummy_signature',
        qrCandyPayload: 'CANDY:COMBO-DUO:TCK-TEST-999',
        status: 'ACTIVE',
        createdAt: DateTime.now().toIso8601String(),
      );

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: TicketDetailView(ticket: ticket),
        ),
      );
      await tester.pump();

      // Verificar que ambos encabezados de QR están en pantalla
      expect(find.text('QR LLAVE DE ACCESO'), findsOneWidget);
      expect(find.text('QR DE CONFITERÍA'), findsOneWidget);

      // Verificar que se renderizan dos canvas de códigos QR mediante QrImageView
      expect(find.byType(QrImageView), findsNWidgets(2));

      // Verificar datos de sala y butacas
      expect(find.text('Sala 1 (IMAX)'), findsOneWidget);
      expect(find.text('F12, F13'), findsOneWidget);
      expect(find.text('Proyección In-App Directa • Sin descargas'), findsNWidgets(2));
    });
  });
}
