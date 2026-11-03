import 'package:equatable/equatable.dart';

abstract class ScannerEvent extends Equatable {
  const ScannerEvent();

  @override
  List<Object?> get props => [];
}

/// Evento disparado cuando la cámara o el simulador detecta un código QR
class ScanQrCodeEvent extends ScannerEvent {
  final String rawPayload;

  const ScanQrCodeEvent(this.rawPayload);

  @override
  List<Object?> get props => [rawPayload];
}

/// Evento para reiniciar el visor tras el cierre de un banner
class ResetScannerEvent extends ScannerEvent {
  const ResetScannerEvent();
}

/// Evento para recargar el conteo de aforo de la sala actual
class LoadAttendanceCountEvent extends ScannerEvent {
  final String? roomName;

  const LoadAttendanceCountEvent({this.roomName});

  @override
  List<Object?> get props => [roomName];
}
