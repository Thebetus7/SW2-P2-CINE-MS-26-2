<?php

namespace App\Jobs;

use App\Models\DigitalTicket;
use App\Services\CryptoSignatureService;

/**
 * T6.1 [IMPL] Consumidor SAGA de Generación de Tickets (PLAN-28)
 * Escucha el evento order.paid.event emitido por el orquestador SAGA de ticketing-auth
 * y genera los boletos digitales inmutables con sus respectivos códigos QR Llave firmados
 * y vouchers de confitería.
 */
class GenerateTicketSagaJob
{
    private CryptoSignatureService $cryptoService;
    private static array $emittedTickets = [];

    public function __construct(?CryptoSignatureService $cryptoService = null)
    {
        $this->cryptoService = $cryptoService ?? new CryptoSignatureService();
    }

    /**
     * Procesa el evento 'order.paid.event' deserializado.
     * Retorna el arreglo de DigitalTickets generados y registrados.
     */
    public function handle(array $orderPaidPayload): array
    {
        if (empty($orderPaidPayload['orderId'])) {
            throw new \InvalidArgumentException("El evento debe contener un orderId válido.");
        }
        if (empty($orderPaidPayload['showtimeId']) || empty($orderPaidPayload['seats'])) {
            throw new \InvalidArgumentException("El evento requiere showtimeId y una lista de asientos seleccionados.");
        }

        $orderId = $orderPaidPayload['orderId'];
        $userId = $orderPaidPayload['userId'] ?? 'user-anonymous';
        $userEmail = $orderPaidPayload['userEmail'] ?? 'guest@cinecenter.com';
        $showtimeId = $orderPaidPayload['showtimeId'];
        $movieTitle = $orderPaidPayload['movieTitle'] ?? 'Película sin título';
        $hallName = $orderPaidPayload['hallName'] ?? 'Sala Principal';
        $priceCentsPerSeat = $orderPaidPayload['priceCentsPerSeat'] ?? 3500;
        $seats = (array) $orderPaidPayload['seats'];
        $candyCombo = $orderPaidPayload['candyCombo'] ?? null;

        $generatedTickets = [];

        // Generar un código de voucher de confitería único para la orden si incluye combo
        $orderCandyToken = null;
        if (!empty($candyCombo)) {
            $orderCandyToken = 'CANDY-' . strtoupper(substr(hash('sha256', $orderId . '-candy'), 0, 8));
        }

        foreach ($seats as $index => $seatCode) {
            $ticketCode = 'TCK-' . strtoupper(substr(hash('sha256', "{$orderId}-{$seatCode}-{$index}"), 0, 8));
            
            // Generar el QR Llave firmado criptográficamente
            $qrHallKey = $this->cryptoService->generateHallKey([
                'ticketCode' => $ticketCode,
                'showtimeId' => $showtimeId,
                'seatCode' => $seatCode,
                'movieTitle' => $movieTitle,
                'hallName' => $hallName,
                'userId' => $userId,
                'orderId' => $orderId,
            ]);

            $ticket = new DigitalTicket([
                'id' => 'ticket-' . bin2hex(random_bytes(6)),
                'ticketCode' => $ticketCode,
                'showtimeId' => $showtimeId,
                'hallName' => $hallName,
                'movieTitle' => $movieTitle,
                'seatCode' => $seatCode,
                'userId' => $userId,
                'userEmail' => $userEmail,
                'priceCents' => $priceCentsPerSeat,
                'qrHallKey' => $qrHallKey,
                'qrCandyToken' => $index === 0 ? $orderCandyToken : null, // Asociado al primer boleto de la orden
                'candyComboDetails' => $index === 0 ? $candyCombo : null,
                'candyRedeemed' => false,
                'status' => 'ISSUED',
                'createdAt' => gmdate('Y-m-d\TH:i:s\Z'),
                'updatedAt' => gmdate('Y-m-d\TH:i:s\Z')
            ]);

            self::$emittedTickets[$ticket->id] = $ticket;
            $generatedTickets[] = $ticket;
        }

        return $generatedTickets;
    }

    /**
     * Recupera todos los tickets emitidos en memoria/almacenamiento
     */
    public static function getEmittedTickets(): array
    {
        return self::$emittedTickets;
    }

    /**
     * Limpia la persistencia en memoria para aislar pruebas
     */
    public static function reset(): void
    {
        self::$emittedTickets = [];
    }
}
