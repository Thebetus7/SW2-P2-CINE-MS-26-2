import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/crypto/crypto_qr_verifier.dart';
import '../../../core/database/sqlite_wallet_db.dart';
import 'scanner_event.dart';
import 'scanner_state.dart';

/// BLoC que gestiona el flujo transaccional de escaneo y validación de boletos para el portero
class ScannerBloc extends Bloc<ScannerEvent, ScannerState> {
  final CryptoQrVerifier _verifier;
  final SqliteWalletDb _database;

  ScannerBloc({
    required CryptoQrVerifier verifier,
    required SqliteWalletDb database,
  })  : _verifier = verifier,
        _database = database,
        super(const ScannerState()) {
    on<ScanQrCodeEvent>(_onScanQrCode);
    on<ResetScannerEvent>(_onResetScanner);
    on<LoadAttendanceCountEvent>(_onLoadAttendanceCount);
  }

  Future<void> _onLoadAttendanceCount(
    LoadAttendanceCountEvent event,
    Emitter<ScannerState> emit,
  ) async {
    final count = await _database.getAttendanceCount(roomName: event.roomName);
    emit(state.copyWith(attendanceCount: count, lastRoomName: event.roomName));
  }

  Future<void> _onResetScanner(
    ResetScannerEvent event,
    Emitter<ScannerState> emit,
  ) async {
    emit(state.copyWith(
      isScanning: true,
      isValidating: false,
      feedbackType: ScanFeedbackType.none,
      bannerMessage: null,
    ));
  }

  Future<void> _onScanQrCode(
    ScanQrCodeEvent event,
    Emitter<ScannerState> emit,
  ) async {
    if (state.isValidating) return; // Evitar disparos concurrentes en el mismo frame

    emit(state.copyWith(isValidating: true, isScanning: false));

    // 1. Verificación matemática offline de la firma HMAC-SHA256
    final validation = await _verifier.verifyPayload(event.rawPayload);

    if (!validation.isValid) {
      final message = validation.isExpired
          ? 'Boleto Vencido (Función Expirada)'
          : 'Boleto Inválido o Ya Utilizado';

      emit(state.copyWith(
        isValidating: false,
        feedbackType: ScanFeedbackType.invalid,
        bannerMessage: message,
        lastScannedTicketId: validation.ticketId,
      ));
      return;
    }

    final ticketId = validation.ticketId ?? 'UNKNOWN';
    final roomName = validation.roomName ?? 'Sala General';

    // 2. Registro transaccional en SQLite y comprobación de doble uso
    final isPermitted = await _database.registerScan(
      ticketId: ticketId,
      roomName: roomName,
    );

    if (!isPermitted) {
      // Duplicado detectado
      emit(state.copyWith(
        isValidating: false,
        feedbackType: ScanFeedbackType.duplicate,
        bannerMessage: 'Boleto Ya Utilizado',
        lastScannedTicketId: ticketId,
        lastRoomName: roomName,
      ));
      return;
    }

    // Acceso permitido por primera vez: recalcular aforo
    final newAttendance = await _database.getAttendanceCount(roomName: roomName);

    emit(state.copyWith(
      isValidating: false,
      feedbackType: ScanFeedbackType.permitted,
      bannerMessage: 'Acceso Permitido — $roomName',
      lastScannedTicketId: ticketId,
      lastRoomName: roomName,
      attendanceCount: newAttendance,
    ));
  }
}
