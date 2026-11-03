import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'key_storage_service.dart';

/// Resultado estructurado de la verificación criptográfica offline del QR Llave.
class QrValidationResult {
  final bool isValid;
  final bool isExpired;
  final String? ticketId;
  final String? roomName;
  final int? expiresAtMs;
  final String message;

  const QrValidationResult({
    required this.isValid,
    this.isExpired = false,
    this.ticketId,
    this.roomName,
    this.expiresAtMs,
    required this.message,
  });

  factory QrValidationResult.valid({
    required String ticketId,
    required String roomName,
    required int expiresAtMs,
  }) {
    return QrValidationResult(
      isValid: true,
      isExpired: false,
      ticketId: ticketId,
      roomName: roomName,
      expiresAtMs: expiresAtMs,
      message: 'Firma HMAC válida y vigente',
    );
  }

  factory QrValidationResult.expired({
    required String ticketId,
    required String roomName,
    required int expiresAtMs,
  }) {
    return QrValidationResult(
      isValid: false,
      isExpired: true,
      ticketId: ticketId,
      roomName: roomName,
      expiresAtMs: expiresAtMs,
      message: 'El código QR ha expirado',
    );
  }

  factory QrValidationResult.invalid(String reason) {
    return QrValidationResult(
      isValid: false,
      isExpired: false,
      message: reason,
    );
  }
}

/// Verificador Criptográfico Autónomo en Dart puro para validación offline del QR Llave
/// Cumple INV-BIZ-04: Verificación matemática HMAC-SHA256 en < 50ms sin red.
class CryptoQrVerifier {
  static const String prefix = 'CINELOCK';
  final KeyStorageService _keyStorage;

  CryptoQrVerifier([KeyStorageService? keyStorage])
      : _keyStorage = keyStorage ?? KeyStorageService();

  /// Genera un token canónico para el QR Llave firmado criptográficamente.
  /// Formato: CINELOCK:<ticketId>:<roomName>:<expMs>:<hmacHex>
  static String generateSignedPayload({
    required String ticketId,
    required String roomName,
    required DateTime expiresAt,
    String secretKey = KeyStorageService.defaultSecretKey,
  }) {
    final expMs = expiresAt.millisecondsSinceEpoch;
    final messageToSign = '$prefix:$ticketId:$roomName:$expMs';

    final hmac = Hmac(sha256, utf8.encode(secretKey));
    final digest = hmac.convert(utf8.encode(messageToSign));
    final signatureHex = digest.toString();

    return '$messageToSign:$signatureHex';
  }

  /// Verifica instantáneamente la autenticidad y vigencia del payload del QR Llave.
  Future<QrValidationResult> verifyPayload(
    String rawPayload, {
    DateTime? now,
    String? overrideSecretKey,
  }) async {
    final secretKey = overrideSecretKey ?? await _keyStorage.getSecretKey();
    final currentTime = now ?? DateTime.now();

    final parts = rawPayload.trim().split(':');

    // Debe contener al menos 5 partes: CINELOCK : ticketId : roomName : expMs : signatureHex
    if (parts.length < 5) {
      return QrValidationResult.invalid('Formato de QR Llave no reconocido');
    }

    if (parts[0] != prefix) {
      return QrValidationResult.invalid('Prefijo inválido (no es un QR Llave de Cine Center)');
    }

    final ticketId = parts[1];
    final roomName = parts[2];
    final expMsStr = parts[3];
    final expectedSignature = parts.sublist(4).join(':'); // En caso de que la firma tenga algún separador

    final expMs = int.tryParse(expMsStr);
    if (expMs == null) {
      return QrValidationResult.invalid('Timestamp de expiración inválido');
    }

    // Recalcular firma HMAC sobre los datos
    final messageToSign = '$prefix:$ticketId:$roomName:$expMs';
    final hmac = Hmac(sha256, utf8.encode(secretKey));
    final calculatedDigest = hmac.convert(utf8.encode(messageToSign)).toString();

    // Verificación en tiempo constante (previene timing attacks)
    if (!_constantTimeEquals(calculatedDigest, expectedSignature)) {
      return QrValidationResult.invalid('Firma digital HMAC inválida o adulterada');
    }

    // Verificar si expiró
    if (currentTime.millisecondsSinceEpoch > expMs) {
      return QrValidationResult.expired(
        ticketId: ticketId,
        roomName: roomName,
        expiresAtMs: expMs,
      );
    }

    return QrValidationResult.valid(
      ticketId: ticketId,
      roomName: roomName,
      expiresAtMs: expMs,
    );
  }

  /// Comparación en tiempo constante para evitar ataques de canal lateral (Timing Attacks)
  bool _constantTimeEquals(String a, String b) {
    if (a.length != b.length) return false;
    var result = 0;
    for (var i = 0; i < a.length; i++) {
      result |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    }
    return result == 0;
  }
}
