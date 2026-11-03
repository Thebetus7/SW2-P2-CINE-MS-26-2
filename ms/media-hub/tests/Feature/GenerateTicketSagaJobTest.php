<?php

namespace Tests\Feature;

require_once __DIR__ . '/../../app/Models/DigitalTicket.php';
require_once __DIR__ . '/../../app/Services/CryptoSignatureService.php';
require_once __DIR__ . '/../../app/Jobs/GenerateTicketSagaJob.php';

use App\Models\DigitalTicket;
use App\Services\CryptoSignatureService;
use App\Jobs\GenerateTicketSagaJob;

class GenerateTicketSagaJobTest
{
    public function run(): void
    {
        $this->testSuccessfulSagaTicketEmission();
        $this->testVerifyHallKeyIntegrity();
        $this->testRejectPayloadWithoutRequiredFields();
        $this->testTicketWithoutCandyCombo();
        echo "PASS: GenerateTicketSagaJobTest completado exitosamente (4/4 casos verificados).\n";
    }

    public function testSuccessfulSagaTicketEmission(): void
    {
        GenerateTicketSagaJob::reset();
        $cryptoService = new CryptoSignatureService();
        $job = new GenerateTicketSagaJob($cryptoService);

        $payload = [
            'orderId' => 'ord-saga-98765',
            'userId' => 'usr-client-44',
            'userEmail' => 'roberto.gomez@example.com',
            'showtimeId' => 'shw-dune-2026',
            'movieTitle' => 'Dune: Part Two (IMAX 3D)',
            'hallName' => 'Sala 1 - MacroXE',
            'seats' => ['F-12', 'F-13'],
            'priceCentsPerSeat' => 4500,
            'candyCombo' => [
                'name' => 'Combo Pareja Extremo',
                'items' => ['2 Popcorn Gigante', '2 Bebidas 32oz', '1 Nachos con Queso']
            ]
        ];

        $tickets = $job->handle($payload);

        assert(count($tickets) === 2, "Deben generarse exactamente 2 boletos.");
        
        $ticket1 = $tickets[0];
        $ticket2 = $tickets[1];

        assert($ticket1->showtimeId === 'shw-dune-2026');
        assert($ticket1->movieTitle === 'Dune: Part Two (IMAX 3D)');
        assert($ticket1->hallName === 'Sala 1 - MacroXE');
        assert($ticket1->seatCode === 'F-12');
        assert($ticket1->status === 'ISSUED');
        assert(!empty($ticket1->qrHallKey));
        assert(!empty($ticket1->qrCandyToken));
        assert(str_starts_with($ticket1->qrCandyToken, 'CANDY-'));
        assert($ticket1->candyRedeemed === false);
        assert($ticket1->candyComboDetails['name'] === 'Combo Pareja Extremo');

        assert($ticket2->seatCode === 'F-13');
        assert($ticket2->status === 'ISSUED');
        assert(!empty($ticket2->qrHallKey));
        assert($ticket2->qrCandyToken === null, "El voucher de confitería se asocia una sola vez a la orden.");
    }

    public function testVerifyHallKeyIntegrity(): void
    {
        $cryptoService = new CryptoSignatureService();
        $job = new GenerateTicketSagaJob($cryptoService);

        $payload = [
            'orderId' => 'ord-saga-verify',
            'userId' => 'usr-123',
            'userEmail' => 'ana@example.com',
            'showtimeId' => 'shw-avatar-01',
            'movieTitle' => 'Avatar 3',
            'hallName' => 'Sala 4',
            'seats' => ['D-5'],
            'priceCentsPerSeat' => 3500
        ];

        $tickets = $job->handle($payload);
        $ticket = $tickets[0];

        $verification = $cryptoService->verifyHallKey($ticket->qrHallKey);
        assert($verification['isValid'] === true, "La firma del QR Llave debe ser 100% válida.");
        assert($verification['payload']['seatCode'] === 'D-5');
        assert($verification['payload']['ticketCode'] === $ticket->ticketCode);
        assert($verification['payload']['showtimeId'] === 'shw-avatar-01');
    }

    public function testRejectPayloadWithoutRequiredFields(): void
    {
        $job = new GenerateTicketSagaJob();
        $caught = false;

        try {
            $job->handle(['userId' => 'usr-missing-fields']);
        } catch (\InvalidArgumentException $e) {
            $caught = true;
        }

        assert($caught === true, "Debe lanzar InvalidArgumentException cuando faltan orderId o showtimeId.");
    }

    public function testTicketWithoutCandyCombo(): void
    {
        $job = new GenerateTicketSagaJob();
        $payload = [
            'orderId' => 'ord-no-candy-77',
            'userId' => 'usr-test',
            'showtimeId' => 'shw-01',
            'movieTitle' => 'Gladiator II',
            'hallName' => 'Sala 2',
            'seats' => ['A-1'],
            'priceCentsPerSeat' => 3000,
            'candyCombo' => null
        ];

        $tickets = $job->handle($payload);
        assert(count($tickets) === 1);
        assert($tickets[0]->qrCandyToken === null);
        assert($tickets[0]->candyComboDetails === null);
        assert($tickets[0]->canRedeemCandy() === false);
    }
}

// Ejecutar pruebas directamente si se llama desde CLI
if (php_sapi_name() === 'cli' && realpath($argv[0] ?? '') === realpath(__FILE__)) {
    (new GenerateTicketSagaJobTest())->run();
}
