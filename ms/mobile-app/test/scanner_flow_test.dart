import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mobile_app/core/crypto/crypto_qr_verifier.dart';
import 'package:mobile_app/core/database/migrations.dart';
import 'package:mobile_app/core/database/sqlite_wallet_db.dart';
import 'package:mobile_app/features/gatekeeper/bloc/scanner_bloc.dart';
import 'package:mobile_app/features/gatekeeper/bloc/scanner_event.dart';
import 'package:mobile_app/features/gatekeeper/bloc/scanner_state.dart';

void main() {
  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  });

  group('Gatekeeper Scanner Flow Tests (SC-02.1 / RF-02.1)', () {
    late Database rawDb;
    late SqliteWalletDb database;
    late CryptoQrVerifier verifier;
    late ScannerBloc bloc;

    setUp(() async {
      rawDb = await databaseFactoryFfi.openDatabase(
        inMemoryDatabasePath,
        options: OpenDatabaseOptions(
          version: DatabaseMigrations.currentVersion,
          onCreate: DatabaseMigrations.onCreate,
        ),
      );
      database = SqliteWalletDb(rawDb);
      verifier = CryptoQrVerifier();
      bloc = ScannerBloc(verifier: verifier, database: database);
    });

    tearDown(() async {
      await bloc.close();
      await rawDb.close();
    });

    test('First valid scan yields permitted feedback and increments attendance', () async {
      final validPayload = CryptoQrVerifier.generateSignedPayload(
        ticketId: 'TCK-FLOW-01',
        roomName: 'Sala 1 (IMAX)',
        expiresAt: DateTime.now().add(const Duration(hours: 2)),
      );

      bloc.add(ScanQrCodeEvent(validPayload));

      await expectLater(
        bloc.stream,
        emitsInOrder([
          predicate<ScannerState>((s) => s.isValidating && !s.isScanning),
          predicate<ScannerState>((s) =>
              !s.isValidating &&
              s.feedbackType == ScanFeedbackType.permitted &&
              s.bannerMessage == 'Acceso Permitido — Sala 1 (IMAX)' &&
              s.attendanceCount == 1),
        ]),
      );
    });

    test('Second scan of same ticket yields duplicate feedback and rejects access', () async {
      final validPayload = CryptoQrVerifier.generateSignedPayload(
        ticketId: 'TCK-FLOW-DUPLICATE',
        roomName: 'Sala 1 (IMAX)',
        expiresAt: DateTime.now().add(const Duration(hours: 2)),
      );

      // Primer escaneo (permitido)
      bloc.add(ScanQrCodeEvent(validPayload));
      await bloc.stream.firstWhere((s) => s.feedbackType == ScanFeedbackType.permitted);

      // Segundo escaneo (duplicado)
      bloc.add(ScanQrCodeEvent(validPayload));

      await expectLater(
        bloc.stream,
        emitsInOrder([
          predicate<ScannerState>((s) => s.isValidating),
          predicate<ScannerState>((s) =>
              !s.isValidating &&
              s.feedbackType == ScanFeedbackType.duplicate &&
              s.bannerMessage == 'Boleto Ya Utilizado'),
        ]),
      );
    });

    test('Corrupted payload yields invalid feedback', () async {
      bloc.add(const ScanQrCodeEvent('MALFORMED_CORRUPTED_CODE'));

      await expectLater(
        bloc.stream,
        emitsInOrder([
          predicate<ScannerState>((s) => s.isValidating),
          predicate<ScannerState>((s) =>
              !s.isValidating &&
              s.feedbackType == ScanFeedbackType.invalid &&
              s.bannerMessage!.contains('Boleto Inválido')),
        ]),
      );
    });
  });
}
