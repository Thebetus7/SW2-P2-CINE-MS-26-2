<?php

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Services/CryptoSignatureService.php';

use App\Services\CryptoSignatureService;

class CryptoSignatureTest
{
    public function run(): void
    {
        $this->testGenerateAndVerifyValidHallKey();
        $this->testRejectTamperedSignature();
        $this->testRejectExpiredToken();
        echo "PASS: CryptoSignatureTest completado exitosamente (3/3 casos verificados).\n";
    }

    public function testGenerateAndVerifyValidHallKey(): void
    {
        $service = new CryptoSignatureService('test_secret_key_123');

        $payload = [
            'ticketCode' => 'TCK-BOL-8841',
            'showtimeId' => 'show-imax-01',
            'seatCode' => 'F12',
            'validUntilTimestamp' => time() + 3600 // Válido por 1 hora
        ];

        $token = $service->generateHallKey($payload);

        assert(!empty($token), "El token no debe estar vacío");
        assert(strpos($token, '.') !== false, "El token debe contener un punto delimitador");

        $verification = $service->verifyHallKey($token);

        assert($verification['isValid'] === true, "La verificación debe ser exitosa");
        assert($verification['payload']['ticketCode'] === 'TCK-BOL-8841');
        assert($verification['payload']['seatCode'] === 'F12');
        assert($verification['error'] === null);
    }

    public function testRejectTamperedSignature(): void
    {
        $service = new CryptoSignatureService('test_secret_key_123');

        $payload = [
            'ticketCode' => 'TCK-BOL-8841',
            'showtimeId' => 'show-imax-01',
            'seatCode' => 'F12',
            'validUntilTimestamp' => time() + 3600
        ];

        $token = $service->generateHallKey($payload);

        // Adulterar la firma (cambiar el último caracter)
        $tamperedToken = substr($token, 0, -1) . 'X';

        $verification = $service->verifyHallKey($tamperedToken);

        assert($verification['isValid'] === false, "El token adulterado debe ser rechazado");
        assert(strpos($verification['error'], 'Firma digital inválida') !== false);
    }

    public function testRejectExpiredToken(): void
    {
        $service = new CryptoSignatureService('test_secret_key_123');

        $payload = [
            'ticketCode' => 'TCK-BOL-8841',
            'showtimeId' => 'show-imax-01',
            'seatCode' => 'F12',
            'validUntilTimestamp' => time() - 60 // Expiró hace 1 minuto
        ];

        $token = $service->generateHallKey($payload);
        $verification = $service->verifyHallKey($token);

        assert($verification['isValid'] === false, "El token expirado debe ser rechazado");
        assert(strpos($verification['error'], 'Boleto expirado') !== false);
    }
}

if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    $test = new CryptoSignatureTest();
    $test->run();
}
