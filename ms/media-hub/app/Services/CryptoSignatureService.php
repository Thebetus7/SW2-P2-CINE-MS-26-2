<?php

namespace App\Services;

class CryptoSignatureService
{
    private string $secretKey;

    public function __construct(?string $secretKey = null)
    {
        $this->secretKey = $secretKey ?? (getenv('HMAC_SECRET_KEY') ?: 'cinecenter_hmac_secret_key_2026_super_secure');
    }

    /**
     * INV-BIZ-04: Genera el token criptográfico del QR Llave firmado con HMAC-SHA256.
     */
    public function generateHallKey(array $payload): string
    {
        if (empty($payload['ticketCode']) || empty($payload['showtimeId']) || empty($payload['seatCode'])) {
            throw new \InvalidArgumentException("El payload del QR Llave debe incluir ticketCode, showtimeId y seatCode.");
        }

        // Si no viene timestamp de expiración, asignar 24 horas por defecto
        if (empty($payload['validUntilTimestamp'])) {
            $payload['validUntilTimestamp'] = time() + (24 * 3600);
        }

        $jsonPayload = json_encode($payload, JSON_UNESCAPED_SLASHES);
        $encodedPayload = $this->base64UrlEncode($jsonPayload);
        $signature = hash_hmac('sha256', $encodedPayload, $this->secretKey);

        return $encodedPayload . '.' . $signature;
    }

    /**
     * INV-BIZ-04 / SC-03.1: Verificación offline de autenticidad e integridad del QR Llave.
     * Retorna array con ['isValid' => bool, 'payload' => array|null, 'error' => string|null].
     */
    public function verifyHallKey(string $token): array
    {
        if (empty($token) || strpos($token, '.') === false) {
            return [
                'isValid' => false,
                'payload' => null,
                'error' => 'Formato de token de QR Llave inválido.'
            ];
        }

        [$encodedPayload, $providedSignature] = explode('.', $token, 2);

        // Recalcular firma con la clave secreta compartida
        $expectedSignature = hash_hmac('sha256', $encodedPayload, $this->secretKey);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            return [
                'isValid' => false,
                'payload' => null,
                'error' => 'Firma digital inválida: Posible token falsificado o adulterado.'
            ];
        }

        $decodedJson = $this->base64UrlDecode($encodedPayload);
        $payload = json_decode($decodedJson, true);

        if (!$payload || !is_array($payload)) {
            return [
                'isValid' => false,
                'payload' => null,
                'error' => 'No se pudo decodificar el payload JSON del boleto.'
            ];
        }

        // Comprobar expiración
        $now = time();
        $validUntil = $payload['validUntilTimestamp'] ?? 0;
        if ($validUntil < $now) {
            return [
                'isValid' => false,
                'payload' => $payload,
                'error' => 'Boleto expirado: La función o ventana de acceso a sala ha caducado.'
            ];
        }

        return [
            'isValid' => true,
            'payload' => $payload,
            'error' => null
        ];
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
