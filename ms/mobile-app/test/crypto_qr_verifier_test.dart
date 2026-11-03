import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/crypto/crypto_qr_verifier.dart';
import 'package:mobile_app/core/crypto/key_storage_service.dart';

void main() {
  group('CryptoQrVerifier Unit Tests (INV-BIZ-04 / SC-03.1)', () {
    late CryptoQrVerifier verifier;
    const testSecret = 'cine_center_test_secret_key_12345';

    setUp(() {
      final keyStorage = KeyStorageService(initialSecretKey: testSecret);
      verifier = CryptoQrVerifier(keyStorage);
    });

    test('Valid signed payload returns isValid: true in less than 50ms', () async {
      final expiresAt = DateTime.now().add(const Duration(hours: 2));
      final payload = CryptoQrVerifier.generateSignedPayload(
        ticketId: 'TCK-8801',
        roomName: 'Sala 1 (IMAX)',
        expiresAt: expiresAt,
        secretKey: testSecret,
      );

      final stopwatch = Stopwatch()..start();
      final result = await verifier.verifyPayload(payload);
      stopwatch.stop();

      expect(stopwatch.elapsedMilliseconds, lessThan(50));
      expect(result.isValid, isTrue);
      expect(result.isExpired, isFalse);
      expect(result.ticketId, equals('TCK-8801'));
      expect(result.roomName, equals('Sala 1 (IMAX)'));
    });

    test('Tampered ticketId is detected and rejected', () async {
      final expiresAt = DateTime.now().add(const Duration(hours: 2));
      final payload = CryptoQrVerifier.generateSignedPayload(
        ticketId: 'TCK-8801',
        roomName: 'Sala 1 (IMAX)',
        expiresAt: expiresAt,
        secretKey: testSecret,
      );

      // Adulterar el ticketId cambiando un dígito
      final tamperedPayload = payload.replaceFirst('TCK-8801', 'TCK-8809');

      final result = await verifier.verifyPayload(tamperedPayload);
      expect(result.isValid, isFalse);
      expect(result.message, contains('Firma digital HMAC inválida o adulterada'));
    });

    test('Wrong secret key is rejected', () async {
      final expiresAt = DateTime.now().add(const Duration(hours: 2));
      final payload = CryptoQrVerifier.generateSignedPayload(
        ticketId: 'TCK-8801',
        roomName: 'Sala 1 (IMAX)',
        expiresAt: expiresAt,
        secretKey: 'wrong_secret_key_here',
      );

      final result = await verifier.verifyPayload(payload);
      expect(result.isValid, isFalse);
    });

    test('Expired payload is flagged with isExpired: true and isValid: false', () async {
      final pastDate = DateTime.now().subtract(const Duration(minutes: 30));
      final payload = CryptoQrVerifier.generateSignedPayload(
        ticketId: 'TCK-EXPIRED-99',
        roomName: 'Sala 2',
        expiresAt: pastDate,
        secretKey: testSecret,
      );

      final result = await verifier.verifyPayload(payload);
      expect(result.isValid, isFalse);
      expect(result.isExpired, isTrue);
      expect(result.ticketId, equals('TCK-EXPIRED-99'));
      expect(result.message, contains('expirado'));
    });

    test('Malformed payload string returns invalid format error', () async {
      final result = await verifier.verifyPayload('MALFORMED_DATA_WITHOUT_PARTS');
      expect(result.isValid, isFalse);
      expect(result.message, contains('no reconocido'));
    });
  });
}
