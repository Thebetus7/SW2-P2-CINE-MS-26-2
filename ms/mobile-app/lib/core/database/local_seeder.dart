import '../crypto/crypto_qr_verifier.dart';
import 'sqlite_wallet_db.dart';

/// Seeder para precargar boletos de demostración offline en la base de datos local.
class LocalSeeder {
  final SqliteWalletDb db;

  LocalSeeder(this.db);

  /// Si la tabla de boletos está vacía, inserta 2 boletos de prueba para cliente@test.com
  Future<void> seedIfEmpty() async {
    final tickets = await db.getAllTickets();
    if (tickets.isNotEmpty) return;

    final now = DateTime.now();

    // Generar payloads con firmas HMAC-SHA256 válidas
    final qrPayload1 = CryptoQrVerifier.generateSignedPayload(
      ticketId: 'TCK-CINE-8801',
      roomName: 'Sala 1 (IMAX)',
      expiresAt: now.add(const Duration(hours: 4)),
    );

    final qrPayload2 = CryptoQrVerifier.generateSignedPayload(
      ticketId: 'TCK-CINE-8802',
      roomName: 'Sala 3 (MacroXE)',
      expiresAt: now.add(const Duration(days: 1, hours: 2)),
    );

    // Boleto 1: Función de Hoy en Sala 1 (IMAX)
    final ticket1 = LocalTicket(
      ticketId: 'TCK-CINE-8801',
      customerEmail: 'cliente@test.com',
      movieTitle: 'Dune: Parte Dos',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      roomName: 'Sala 1 (IMAX)',
      showtime: 'Hoy 20:30',
      seats: 'F12, F13',
      qrLlavePayload: qrPayload1,
      qrCandyPayload: 'CANDY:COMBO-DUO-PALOMITAS:TCK-CINE-8801',
      status: 'ACTIVE',
      createdAt: now.toIso8601String(),
    );

    // Boleto 2: Función de Mañana en Sala 3 (MacroXE)
    final ticket2 = LocalTicket(
      ticketId: 'TCK-CINE-8802',
      customerEmail: 'cliente@test.com',
      movieTitle: 'Oppenheimer',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      roomName: 'Sala 3 (MacroXE)',
      showtime: 'Mañana 18:15',
      seats: 'G04',
      qrLlavePayload: qrPayload2,
      qrCandyPayload: 'CANDY:NACHOS-REFRESCO:TCK-CINE-8802',
      status: 'ACTIVE',
      createdAt: now.toIso8601String(),
    );

    await db.insertTicket(ticket1);
    await db.insertTicket(ticket2);
  }
}
