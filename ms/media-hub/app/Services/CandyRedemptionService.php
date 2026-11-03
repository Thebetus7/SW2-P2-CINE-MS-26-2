<?php

namespace App\Services;

use App\Models\DigitalTicket;

class CandyRedemptionService
{
    /** @var array<string, DigitalTicket> */
    private array $ticketStore = [];

    public function __construct(array $initialTickets = [])
    {
        foreach ($initialTickets as $ticket) {
            $this->ticketStore[$ticket->ticketCode] = $ticket;
            if ($ticket->qrCandyToken) {
                $this->ticketStore[$ticket->qrCandyToken] = $ticket;
            }
        }
    }

    public function addTicket(DigitalTicket $ticket): void
    {
        $this->ticketStore[$ticket->ticketCode] = $ticket;
        if ($ticket->qrCandyToken) {
            $this->ticketStore[$ticket->qrCandyToken] = $ticket;
        }
    }

    /**
     * RB-03.3 / SC-02.1: Procesa el canje atómico del combo de confitería con bloqueo estricto de duplicidad.
     *
     * @param string $tokenOrTicketCode
     * @param string $cashierId
     * @param string $counterId
     * @param string $terminalIp
     * @return array
     */
    public function redeemCandyCombo(
        string $tokenOrTicketCode,
        string $cashierId,
        string $counterId = 'CAJA-01',
        string $terminalIp = '127.0.0.1'
    ): array {
        $cleanCode = trim($tokenOrTicketCode);
        if (empty($cleanCode)) {
            throw new \InvalidArgumentException("Debe ingresar o escanear un código de boleto o token de confitería válido.");
        }

        if (!isset($this->ticketStore[$cleanCode])) {
            throw new \DomainException("No se encontró ningún boleto activo asociado al código: '{$cleanCode}'.");
        }

        $ticket = $this->ticketStore[$cleanCode];

        // Ejecuta la validación atómica y marca el canje con auditoría (lanza DomainException si ya fue canjeado)
        $ticket->markCandyAsRedeemed($cashierId, $counterId, $terminalIp);

        return [
            'status' => 'SUCCESS',
            'ticketCode' => $ticket->ticketCode,
            'movieTitle' => $ticket->movieTitle,
            'hallName' => $ticket->hallName,
            'seatCode' => $ticket->seatCode,
            'comboName' => $ticket->candyComboDetails['name'] ?? 'Combo Dúo Clásico',
            'comboItems' => $ticket->candyComboDetails['items'] ?? [],
            'audit' => $ticket->candyRedemptionAudit,
            'message' => '¡Canje de confitería autorizado exitosamente! Entregar productos al cliente.'
        ];
    }

    public function findByCode(string $code): ?DigitalTicket
    {
        return $this->ticketStore[trim($code)] ?? null;
    }
}
