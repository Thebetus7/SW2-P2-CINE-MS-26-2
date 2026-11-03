<?php

namespace Tests\Feature;

require_once __DIR__ . '/../../app/Models/DigitalTicket.php';
require_once __DIR__ . '/../../app/Services/CandyRedemptionService.php';

use App\Models\DigitalTicket;
use App\Services\CandyRedemptionService;

class CandyRedemptionAuditTest
{
    public function run(): void
    {
        $this->testSuccessfulFirstRedemption();
        $this->testBlockAtomicDoubleRedemption();
        $this->testRejectNonExistentTicket();
        $this->testRejectTicketWithoutCandyCombo();
        echo "PASS: CandyRedemptionAuditTest completado exitosamente (4/4 casos verificados).\n";
    }

    public function testSuccessfulFirstRedemption(): void
    {
        $ticket = new DigitalTicket([
            'id' => 'tck-01',
            'ticketCode' => 'TCK-BOL-8841',
            'qrCandyToken' => 'CANDY-TOKEN-8841',
            'movieTitle' => 'Dune: Part Two',
            'candyComboDetails' => [
                'name' => 'Combo Dúo Clásico',
                'items' => ['Pipoca Salada x2', 'Gaseosa x2']
            ],
            'candyRedeemed' => false,
        ]);

        $service = new CandyRedemptionService([$ticket]);

        $result = $service->redeemCandyCombo(
            'CANDY-TOKEN-8841',
            'cajero-007',
            'CAJA-CANDY-02',
            '192.168.1.50'
        );

        assert($result['status'] === 'SUCCESS');
        assert($result['ticketCode'] === 'TCK-BOL-8841');
        assert($result['audit']['cashierId'] === 'cajero-007');
        assert($result['audit']['counterId'] === 'CAJA-CANDY-02');
        assert($result['audit']['terminalIp'] === '192.168.1.50');
        assert($ticket->candyRedeemed === true, "El boleto debe quedar marcado como canjeado");
    }

    public function testBlockAtomicDoubleRedemption(): void
    {
        $ticket = new DigitalTicket([
            'id' => 'tck-02',
            'ticketCode' => 'TCK-BOL-9923',
            'qrCandyToken' => 'CANDY-TOKEN-9923',
            'candyComboDetails' => [
                'name' => 'Combo Mega VIP',
                'items' => ['Nachos x1', 'Pipoca x1']
            ],
            'candyRedeemed' => false,
        ]);

        $service = new CandyRedemptionService([$ticket]);

        // 1er canje exitoso
        $service->redeemCandyCombo('CANDY-TOKEN-9923', 'cajero-001', 'CAJA-01');
        assert($ticket->candyRedeemed === true);

        // 2do canje: debe fallar atómicamente por duplicidad (RB-03.3)
        $blocked = false;
        try {
            $service->redeemCandyCombo('CANDY-TOKEN-9923', 'cajero-002', 'CAJA-03');
        } catch (\DomainException $e) {
            $blocked = true;
            assert(strpos($e->getMessage(), 'ADVERTENCIA DE DUPLICIDAD') !== false);
            assert(strpos($e->getMessage(), 'cajero-001') !== false);
        }

        assert($blocked === true, "El segundo intento de canje debe ser bloqueado con advertencia de duplicidad");
    }

    public function testRejectNonExistentTicket(): void
    {
        $service = new CandyRedemptionService([]);

        $caught = false;
        try {
            $service->redeemCandyCombo('UNKNOWN-CODE-999', 'cajero-001');
        } catch (\DomainException $e) {
            $caught = true;
            assert(strpos($e->getMessage(), 'No se encontró') !== false);
        }

        assert($caught === true, "Debe rechazar códigos inexistentes");
    }

    public function testRejectTicketWithoutCandyCombo(): void
    {
        $ticketOnly = new DigitalTicket([
            'id' => 'tck-only-entry',
            'ticketCode' => 'TCK-ONLY-ENTRY',
            'candyComboDetails' => null, // Solo entrada a sala
            'candyRedeemed' => false,
        ]);

        $service = new CandyRedemptionService([$ticketOnly]);

        $caught = false;
        try {
            $service->redeemCandyCombo('TCK-ONLY-ENTRY', 'cajero-001');
        } catch (\DomainException $e) {
            $caught = true;
            assert(strpos($e->getMessage(), 'no incluye ningún combo') !== false);
        }

        assert($caught === true, "Debe rechazar boletos sin combo de confitería");
    }
}

if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    $test = new CandyRedemptionAuditTest();
    $test->run();
}
