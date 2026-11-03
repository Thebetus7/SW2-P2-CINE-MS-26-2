import 'package:sqflite/sqflite.dart';

/// Esquemas DDL para la base de datos SQLite local de Cine Center Mobile.
class DatabaseMigrations {
  static const int currentVersion = 1;

  static Future<void> onCreate(Database db, int version) async {
    // Tabla local_tickets: Almacena boletos para visualización offline in-app
    await db.execute('''
      CREATE TABLE local_tickets (
        ticket_id TEXT PRIMARY KEY,
        customer_email TEXT NOT NULL,
        movie_title TEXT NOT NULL,
        poster_url TEXT,
        room_name TEXT NOT NULL,
        showtime TEXT NOT NULL,
        seats TEXT NOT NULL,
        qr_llave_payload TEXT NOT NULL,
        qr_candy_payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL
      );
    ''');

    // Tabla gate_scans: Registro transaccional de escaneos realizados por el portero
    await db.execute('''
      CREATE TABLE gate_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL,
        scanned_at TEXT NOT NULL,
        room_name TEXT NOT NULL,
        status TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
    ''');

    // Índice para búsqueda rápida por ticket_id en gate_scans (detección instantánea de duplicados)
    await db.execute('''
      CREATE INDEX idx_gate_scans_ticket_id ON gate_scans(ticket_id);
    ''');
  }

  static Future<void> onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Futuras migraciones DDL se incorporarán aquí preservando datos existentes
  }
}
