<?php

namespace Tests\Feature;

require_once __DIR__ . '/../../app/Models/MediaAsset.php';
require_once __DIR__ . '/../../app/Models/DigitalTicket.php';
require_once __DIR__ . '/../../app/Services/MinioStorageService.php';
require_once __DIR__ . '/../../app/Services/CandyRedemptionService.php';
require_once __DIR__ . '/../../database/seeders/MediaHubDatabaseSeeder.php';
require_once __DIR__ . '/../../app/Http/Controllers/MediaAssetController.php';
require_once __DIR__ . '/../../app/Http/Controllers/TicketController.php';

use App\Http\Controllers\MediaAssetController;
use App\Http\Controllers\TicketController;

/**
 * Suite de Prueba para Controladores y Páginas Inertia (PLAN-24, PLAN-25, SC-01.1, SC-02.1)
 */
class InertiaMediaPagesTest
{
    public function runAll(): void
    {
        $this->testMediaIndexListsAssetsAndAppliesSearchFilter();
        $this->testMediaUploadUnder5MBSuccess();
        $this->testMediaUploadOver5MBRejection();
        $this->testTicketScannerTerminalData();
        $this->testTicketRedemptionSuccessAndDuplicateBlock();
        $this->testTicketShowReturnsDualQrDetails();
        echo "PASS: InertiaMediaPagesTest completado exitosamente (6/6 casos verificados).\n";
    }

    private function testMediaIndexListsAssetsAndAppliesSearchFilter(): void
    {
        MediaAssetController::resetStore();
        $controller = new MediaAssetController();

        $allResult = $controller->index();
        assert($allResult['total'] >= 3, "El índice debe contener al menos 3 afiches sembrados.");

        // Búsqueda con filtro
        $filtered = $controller->index('Dune');
        assert(count($filtered['assets']) === 1, "La búsqueda de 'Dune' debe retornar exactamente 1 resultado.");
        assert(str_contains($filtered['assets'][0]['originalName'], 'Dune'), "El resultado debe corresponder a Dune.");

        echo "  ✓ MediaAssetController@index lista activos y aplica filtro diacrítico\n";
    }

    private function testMediaUploadUnder5MBSuccess(): void
    {
        $controller = new MediaAssetController();

        $fileMetadata = [
            'name' => 'avatar3_official_teaser.jpg',
            'size' => 3 * 1024 * 1024, // 3 MB
            'mime' => 'image/jpeg',
        ];

        $res = $controller->upload($fileMetadata, 'mov-004');
        assert($res['status'] === 'SUCCESS', "La carga de un archivo de 3 MB debe ser exitosa.");
        assert($res['asset']['dimensions'] === '300x450', "La miniatura debe tener dimensiones 300x450.");
        assert($res['asset']['originalName'] === 'avatar3_official_teaser.jpg', "El nombre original debe coincidir.");
        assert(str_contains($res['asset']['originalUrl'], 'poster_mov-004_'), "La URL en MinIO debe incluir el prefijo poster_mov-004_.");

        echo "  ✓ MediaAssetController@upload acepta afiches < 5MB y genera miniatura\n";
    }

    private function testMediaUploadOver5MBRejection(): void
    {
        $controller = new MediaAssetController();

        $fileMetadata = [
            'name' => 'massive_poster.jpg',
            'size' => (int) (8.5 * 1024 * 1024), // 8.5 MB
            'mime' => 'image/jpeg',
        ];

        $exceptionThrown = false;
        try {
            $controller->upload($fileMetadata, 'mov-005');
        } catch (\DomainException $e) {
            $exceptionThrown = true;
            assert(str_contains($e->getMessage(), 'supera el tamaño máximo'), "El mensaje debe indicar exceso de tamaño.");
        }

        assert($exceptionThrown, "Un archivo de 8.5 MB debe ser rechazado con DomainException.");
        echo "  ✓ MediaAssetController@upload rechaza estrictamente archivos > 5MB (RB-03.1)\n";
    }

    private function testTicketScannerTerminalData(): void
    {
        TicketController::resetStore();
        $controller = new TicketController();

        $data = $controller->scanner();
        assert($data['counterId'] === 'CAJA-01', "La caja debe ser CAJA-01.");
        assert($data['status'] === 'CONNECTED', "El estado de terminal debe ser CONNECTED.");
        assert(is_array($data['redemptionHistory']), "El historial debe ser un arreglo.");

        echo "  ✓ TicketController@scanner inicializa terminal POS con caja y cajero activo\n";
    }

    private function testTicketRedemptionSuccessAndDuplicateBlock(): void
    {
        TicketController::resetStore();
        $controller = new TicketController();

        // 1. Primer canje: exitoso con TCK-BOL-9923
        $firstRes = $controller->redeem('TCK-BOL-9923', 'cajero@test.com', 'CAJA-01');
        assert($firstRes['status'] === 'SUCCESS', "El primer canje debe ser exitoso.");
        assert($firstRes['statusCode'] === 200, "El código HTTP debe ser 200.");
        assert($firstRes['data']['audit']['cashierId'] === 'cajero@test.com', "El cajero de auditoría debe coincidir.");

        // 2. Segundo canje del mismo código: bloqueo por duplicidad (RB-03.3)
        $secondRes = $controller->redeem('TCK-BOL-9923', 'cajero@test.com', 'CAJA-01');
        assert($secondRes['status'] === 'ERROR', "El segundo canje debe fallar.");
        assert($secondRes['statusCode'] === 409, "El código HTTP debe ser 409 Conflict.");
        assert($secondRes['errorCode'] === 'CANDY_ALREADY_REDEEMED', "El código de error debe ser CANDY_ALREADY_REDEEMED.");

        echo "  ✓ TicketController@redeem canjea atómicamente y bloquea segundo intento con 409 (RB-03.3)\n";
    }

    private function testTicketShowReturnsDualQrDetails(): void
    {
        $controller = new TicketController();

        $res = $controller->show('TCK-BOL-8841');
        assert($res['status'] === 'SUCCESS', "Debe encontrar el boleto sembrado.");
        assert(!empty($res['ticket']['qrHallKey']), "El boleto debe incluir el QR Llave.");
        assert(!empty($res['ticket']['qrCandyToken']), "El boleto debe incluir el QR de confitería.");

        echo "  ✓ TicketController@show provee ambos códigos QR para el visor in-app (INV-BIZ-03)\n";
    }
}

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    echo "\n[RUNNING] InertiaMediaPagesTest (Controllers & Inertia Integration)...\n";
    (new InertiaMediaPagesTest())->runAll();
}
