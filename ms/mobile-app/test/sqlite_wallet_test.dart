import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mobile_app/core/database/sqlite_wallet_db.dart';
import 'package:mobile_app/core/database/local_seeder.dart';
import 'package:mobile_app/core/database/migrations.dart';

void main() {
  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  });

  group('SqliteWalletDb & LocalSeeder Tests', () {
    late Database rawDb;
    late SqliteWalletDb walletDb;

    setUp(() async {
      rawDb = await databaseFactoryFfi.openDatabase(
        inMemoryDatabasePath,
        options: OpenDatabaseOptions(
          version: DatabaseMigrations.currentVersion,
          onCreate: DatabaseMigrations.onCreate,
        ),
      );
      walletDb = SqliteWalletDb(rawDb);
    });

    tearDown(() async {
      await rawDb.close();
    });

    test('Seeder inserts 2 initial tickets when db is empty', () async {
      final seeder = LocalSeeder(walletDb);
      await seeder.seedIfEmpty();

      final tickets = await walletDb.getAllTickets();
      expect(tickets.length, equals(2));
      expect(tickets.first.customerEmail, equals('cliente@test.com'));
    });

    test('Register scan allows first entry and rejects duplicate scan', () async {
      final seeder = LocalSeeder(walletDb);
      await seeder.seedIfEmpty();

      // Primer escaneo: debe ser permitido
      final firstScan = await walletDb.registerScan(
        ticketId: 'TCK-CINE-8801',
        roomName: 'Sala 1 (IMAX)',
      );
      expect(firstScan, isTrue);

      // Conteo de aforo debe ser 1
      final count = await walletDb.getAttendanceCount(roomName: 'Sala 1 (IMAX)');
      expect(count, equals(1));

      // Segundo escaneo del mismo boleto: debe ser rechazado como duplicado
      final secondScan = await walletDb.registerScan(
        ticketId: 'TCK-CINE-8801',
        roomName: 'Sala 1 (IMAX)',
      );
      expect(secondScan, isFalse);

      // Conteo de aforo sigue siendo 1
      final countAfterDuplicate = await walletDb.getAttendanceCount(roomName: 'Sala 1 (IMAX)');
      expect(countAfterDuplicate, equals(1));
    });
  });
}
