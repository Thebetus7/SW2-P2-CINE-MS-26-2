/// Servicio para administrar la clave secreta compartida utilizada en la
/// validación y generación de firmas criptográficas HMAC-SHA256 del QR Llave.
class KeyStorageService {
  static const String defaultSecretKey =
      'cine_center_hmac_secret_2026_super_secure_key_offline_verification';

  String _secretKey;

  KeyStorageService({String? initialSecretKey})
      : _secretKey = initialSecretKey ?? defaultSecretKey;

  /// Retorna la clave secreta actual en memoria
  Future<String> getSecretKey() async {
    return _secretKey;
  }

  /// Permite actualizar la clave secreta (por ejemplo ante rotación de credenciales)
  Future<void> setSecretKey(String newKey) async {
    _secretKey = newKey;
  }
}
