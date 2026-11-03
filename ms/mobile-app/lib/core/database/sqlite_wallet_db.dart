import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;
import 'migrations.dart';

/// Modelo de datos para un boleto local almacenado en SQLite.
class LocalTicket {
  final String ticketId;
  final String customerEmail;
  final String movieTitle;
  final String? posterUrl;
  final String roomName;
  final String showtime;
  final String seats;
  final String qrLlavePayload;
  final String qrCandyPayload;
  final String status; // 'ACTIVE', 'USED', 'EXPIRED'
  final String createdAt;

  LocalTicket({
    required this.ticketId,
    required this.customerEmail,
    required this.movieTitle,
    this.posterUrl,
    required this.roomName,
    required this.showtime,
    required this.seats,
    required this.qrLlavePayload,
    required this.qrCandyPayload,
    this.status = 'ACTIVE',
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'ticket_id': ticketId,
      'customer_email': customerEmail,
      'movie_title': movieTitle,
      'poster_url': posterUrl,
      'room_name': roomName,
      'showtime': showtime,
      'seats': seats,
      'qr_llave_payload': qrLlavePayload,
      'qr_candy_payload': qrCandyPayload,
      'status': status,
      'created_at': createdAt,
    };
  }

  factory LocalTicket.fromMap(Map<String, dynamic> map) {
    return LocalTicket(
      ticketId: map['ticket_id'] as String,
      customerEmail: map['customer_email'] as String,
      movieTitle: map['movie_title'] as String,
      posterUrl: map['poster_url'] as String?,
      roomName: map['room_name'] as String,
      showtime: map['showtime'] as String,
      seats: map['seats'] as String,
      qrLlavePayload: map['qr_llave_payload'] as String,
      qrCandyPayload: map['qr_candy_payload'] as String,
      status: map['status'] as String? ?? 'ACTIVE',
      createdAt: map['created_at'] as String,
    );
  }
}

/// Modelo de registro de escaneo en puerta por el portero.
class GateScanRecord {
  final int? id;
  final String ticketId;
  final String scannedAt;
  final String roomName;
  final String status; // 'PERMITTED', 'DUPLICATE', 'INVALID'
  final bool synced;

  GateScanRecord({
    this.id,
    required this.ticketId,
    required this.scannedAt,
    required this.roomName,
    required this.status,
    this.synced = false,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'ticket_id': ticketId,
      'scanned_at': scannedAt,
      'room_name': roomName,
      'status': status,
      'synced': synced ? 1 : 0,
    };
  }

  factory GateScanRecord.fromMap(Map<String, dynamic> map) {
    return GateScanRecord(
      id: map['id'] as int?,
      ticketId: map['ticket_id'] as String,
      scannedAt: map['scanned_at'] as String,
      roomName: map['room_name'] as String,
      status: map['status'] as String,
      synced: (map['synced'] as int? ?? 0) == 1,
    );
  }
}

/// Gestor y repositorio SQLite local para la Billetera y Control de Acceso.
class SqliteWalletDb {
  static const String databaseName = 'cine_center_wallet.db';

  Database? _db;

  /// Permite inyectar una instancia de Database (útil para tests con FFI o in-memory)
  SqliteWalletDb([Database? db]) : _db = db;

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDatabase();
    return _db!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, databaseName);

    return await openDatabase(
      path,
      version: DatabaseMigrations.currentVersion,
      onCreate: DatabaseMigrations.onCreate,
      onUpgrade: DatabaseMigrations.onUpgrade,
    );
  }

  // --- Operaciones de Boletos del Cliente ---

  Future<void> insertTicket(LocalTicket ticket) async {
    final db = await database;
    await db.insert(
      'local_tickets',
      ticket.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<LocalTicket>> getTicketsByCustomer(String customerEmail) async {
    final db = await database;
    final maps = await db.query(
      'local_tickets',
      where: 'customer_email = ?',
      whereArgs: [customerEmail],
      orderBy: 'created_at DESC',
    );
    return maps.map((m) => LocalTicket.fromMap(m)).toList();
  }

  Future<List<LocalTicket>> getAllTickets() async {
    final db = await database;
    final maps = await db.query('local_tickets', orderBy: 'created_at DESC');
    return maps.map((m) => LocalTicket.fromMap(m)).toList();
  }

  Future<LocalTicket?> getTicketById(String ticketId) async {
    final db = await database;
    final maps = await db.query(
      'local_tickets',
      where: 'ticket_id = ?',
      whereArgs: [ticketId],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return LocalTicket.fromMap(maps.first);
  }

  // --- Operaciones de Portería / Escaneos de Puerta ---

  /// Verifica si un boleto ya fue registrado como PERMITTED anteriormente en gate_scans.
  Future<bool> isTicketAlreadyUsed(String ticketId) async {
    final db = await database;
    final maps = await db.query(
      'gate_scans',
      columns: ['id'],
      where: 'ticket_id = ? AND status = ?',
      whereArgs: [ticketId, 'PERMITTED'],
      limit: 1,
    );
    return maps.isNotEmpty;
  }

  /// Registra un nuevo escaneo en SQLite.
  /// Si ya fue usado, retorna falso (DUPLICATE) e inserta el registro con status DUPLICATE.
  /// Si es nuevo, inserta PERMITTED y actualiza el status local del boleto a USED.
  Future<bool> registerScan({
    required String ticketId,
    required String roomName,
  }) async {
    final db = await database;
    final now = DateTime.now().toIso8601String();

    final alreadyUsed = await isTicketAlreadyUsed(ticketId);

    if (alreadyUsed) {
      await db.insert('gate_scans', {
        'ticket_id': ticketId,
        'scanned_at': now,
        'room_name': roomName,
        'status': 'DUPLICATE',
        'synced': 0,
      });
      return false; // Rechazado por duplicado
    }

    // Registrar como permitido
    await db.insert('gate_scans', {
      'ticket_id': ticketId,
      'scanned_at': now,
      'room_name': roomName,
      'status': 'PERMITTED',
      'synced': 0,
    });

    // Actualizar estado en local_tickets si existe
    await db.update(
      'local_tickets',
      {'status': 'USED'},
      where: 'ticket_id = ?',
      whereArgs: [ticketId],
    );

    return true; // Permitido
  }

  /// Retorna el conteo de ingresos confirmados para una sala o total
  Future<int> getAttendanceCount({String? roomName}) async {
    final db = await database;
    final where = roomName != null ? 'status = ? AND room_name = ?' : 'status = ?';
    final whereArgs = roomName != null ? ['PERMITTED', roomName] : ['PERMITTED'];

    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM gate_scans WHERE $where',
      whereArgs,
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  /// Cierra la conexión si está abierta
  Future<void> close() async {
    if (_db != null && _db!.isOpen) {
      await _db!.close();
      _db = null;
    }
  }
}
