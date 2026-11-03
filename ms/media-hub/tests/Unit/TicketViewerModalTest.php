<?php

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Models/DigitalTicket.php';
require_once __DIR__ . '/../../app/Http/Controllers/HealthController.php';

use App\Models\DigitalTicket;
use App\Http\Controllers\HealthController;

class TicketViewerModalTest
{
    public function run(): void
    {
        $this->testTicketWithDualQRCodes();
        $this->testHealthControllerResponse();
        echo "PASS: TicketViewerModalTest completado exitosamente (2/2 casos verificados).\n";
    }

    public function testTicketWithDualQRCodes(): void
    {
        // Boleto con Entrada a Sala + Combo de Confitería (INV-BIZ-03)
        $ticket = new DigitalTicket([
            'id' => 'tck-dual-01',
            'ticketCode' => 'TCK-BOL-8841',
            'showtimeId' => 'show-01',
            'hallName' => 'Sala 1 - MacroXE',
            'movieTitle' => 'Dune: Part Two',
            'seatCode' => 'F12',
            'qrHallKey' => 'eyJ0aWNrZXQiOiJUQ0stODg0MSJ9.HMAC_KEY',
            'qrCandyToken' => 'CANDY-TOKEN-8841',
            'status' => 'ISSUED',
            'candyComboDetails' => [
                'name' => 'Combo Dúo Clásico',
                'items' => ['Pipoca Salada x2', 'Gaseosa x2']
            ],
            'candyRedeemed' => false,
        ]);

        $arr = $ticket->toArray();

        assert(!empty($arr['qrHallKey']), "Debe contener el QR Llave para acceso a sala");
        assert(!empty($arr['qrCandyToken']), "Debe contener el QR Token para canje en confitería");
        assert($arr['status'] === 'ISSUED');
        assert($arr['candyRedeemed'] === false);
        assert(count($arr['candyComboDetails']['items']) === 2);
    }

    public function testHealthControllerResponse(): void
    {
        $controller = new HealthController();
        $health = $controller->getHealth();

        assert($health['status'] === 'healthy');
        assert($health['service'] === 'media-hub');
        assert($health['port'] === 8080);
        assert($health['storage']['minio'] === 'connected');
        assert($health['database']['mongodb'] === 'connected');
    }
}

if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    $test = new TicketViewerModalTest();
    $test->run();
}
