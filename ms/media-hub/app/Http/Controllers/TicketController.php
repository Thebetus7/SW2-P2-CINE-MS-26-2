<?php

namespace App\Http\Controllers;

use App\Models\DigitalTicket;
use App\Services\CandyRedemptionService;
use Database\Seeders\MediaHubDatabaseSeeder;

/**
 * T4.2 [IMPL] Controlador de Boletos y Terminal POS de Confitería (PLAN-25, RB-03.3)
 * Gestiona el visor in-app de boletos y el escaneo y canje atómico en la terminal de mostrador.
 */
class TicketController
{
    private CandyRedemptionService $redemptionService;
    /** @var array<string, DigitalTicket> */
    private static array $ticketStore = [];
    /** @var array<int, array> */
    private static array $redemptionHistory = [];

    public function __construct(?CandyRedemptionService $redemptionService = null)
    {
        $this->initializeStoreIfEmpty();
        $this->redemptionService = $redemptionService ?? new CandyRedemptionService(array_values(self::$ticketStore));
    }

    private function initializeStoreIfEmpty(): void
    {
        if (empty(self::$ticketStore)) {
            $seeded = MediaHubDatabaseSeeder::seed();
            foreach ($seeded['tickets'] as $ticket) {
                self::$ticketStore[$ticket->ticketCode] = $ticket;
                if ($ticket->qrCandyToken) {
                    self::$ticketStore[$ticket->qrCandyToken] = $ticket;
                }
            }
        }
    }

    /**
     * Retorna datos iniciales para la terminal POS de mostrador (POS/CandyScan)
     */
    public function scanner()
    {
        $data = [
            'counterId' => 'CAJA-01',
            'cashierName' => 'Cajero General (cajero@test.com)',
            'cashierId' => 'cajero@test.com',
            'terminalIp' => '127.0.0.1',
            'redemptionHistory' => self::$redemptionHistory,
            'status' => 'CONNECTED',
        ];

        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('POS/CandyScan', $data);
        }

        return $data;
    }

    /**
     * RB-03.3 / SC-02.1: Procesa el canje atómico del voucher de confitería.
     * Si el voucher ya fue entregado previamente, rechaza con código CANDY_ALREADY_REDEEMED.
     *
     * @param string $code Código de ticket o token de confitería
     * @param string $cashierId Identificador del cajero que atiende
     * @param string $counterId Identificador de caja (ej. CAJA-01)
     * @param string $terminalIp IP de la terminal
     * @return array
     */
    public function redeem(
        string $code,
        string $cashierId = 'cajero@test.com',
        string $counterId = 'CAJA-01',
        string $terminalIp = '127.0.0.1'
    ): array {
        try {
            $result = $this->redemptionService->redeemCandyCombo($code, $cashierId, $counterId, $terminalIp);

            // Registrar en historial local del turno
            $historyEntry = [
                'ticketCode' => $result['ticketCode'],
                'movieTitle' => $result['movieTitle'],
                'comboName' => $result['comboName'],
                'counterId' => $counterId,
                'cashierId' => $cashierId,
                'redeemedAtUtc' => $result['audit']['redeemedAtUtc'] ?? gmdate('Y-m-d\TH:i:s\Z'),
                'time' => gmdate('H:i') . ' UTC',
            ];
            array_unshift(self::$redemptionHistory, $historyEntry);

            return [
                'status' => 'SUCCESS',
                'statusCode' => 200,
                'data' => $result,
                'message' => 'Combo Entregado Satisfactoriamente',
            ];
        } catch (\DomainException $e) {
            $isAlreadyRedeemed = str_contains($e->getMessage(), 'ADVERTENCIA DE DUPLICIDAD') || 
                                 str_contains($e->getMessage(), 'ya fue canjeado');

            return [
                'status' => 'ERROR',
                'statusCode' => $isAlreadyRedeemed ? 409 : 400,
                'errorCode' => $isAlreadyRedeemed ? 'CANDY_ALREADY_REDEEMED' : 'INVALID_VOUCHER',
                'message' => $e->getMessage(),
            ];
        } catch (\InvalidArgumentException $e) {
            return [
                'status' => 'ERROR',
                'statusCode' => 400,
                'errorCode' => 'BAD_REQUEST',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Consulta un boleto por código para visualización en el modal TicketViewerModal.vue
     *
     * @param string $code
     * @return array
     */
    public function show(string $code): array
    {
        $cleanCode = trim($code);
        $ticket = self::$ticketStore[$cleanCode] ?? null;

        if (!$ticket) {
            return [
                'status' => 'NOT_FOUND',
                'statusCode' => 404,
                'message' => "Boleto '{$cleanCode}' no encontrado.",
            ];
        }

        return [
            'status' => 'SUCCESS',
            'statusCode' => 200,
            'ticket' => $ticket->toArray(),
        ];
    }

    /**
     * Registra un nuevo boleto en el almacén del controlador (usado por SAGA y tests)
     */
    public static function registerTicket(DigitalTicket $ticket): void
    {
        self::$ticketStore[$ticket->ticketCode] = $ticket;
        if ($ticket->qrCandyToken) {
            self::$ticketStore[$ticket->qrCandyToken] = $ticket;
        }
    }

    /**
     * Limpia la persistencia en memoria para aislar pruebas
     */
    public static function resetStore(): void
    {
        self::$ticketStore = [];
        self::$redemptionHistory = [];
    }
}
