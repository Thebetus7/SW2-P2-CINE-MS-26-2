<?php

namespace App\Models;

class DigitalTicket
{
    public string $id;
    public string $ticketCode;
    public string $showtimeId;
    public string $hallName;
    public string $movieTitle;
    public string $seatCode;
    public string $userId;
    public string $userEmail;
    public int $priceCents;
    public string $qrHallKey;
    public ?string $qrCandyToken;
    public string $status; // 'ISSUED' | 'USED' | 'CANCELLED'
    public ?array $candyComboDetails;
    public bool $candyRedeemed;
    public ?array $candyRedemptionAudit;
    public string $createdAt;
    public string $updatedAt;

    public function __construct(array $attributes = [])
    {
        $this->id = $attributes['id'] ?? ('ticket-' . bin2hex(random_bytes(6)));
        $this->ticketCode = $attributes['ticketCode'] ?? ('TCK-' . strtoupper(bin2hex(random_bytes(4))));
        $this->showtimeId = $attributes['showtimeId'] ?? '';
        $this->hallName = $attributes['hallName'] ?? '';
        $this->movieTitle = $attributes['movieTitle'] ?? '';
        $this->seatCode = $attributes['seatCode'] ?? '';
        $this->userId = $attributes['userId'] ?? '';
        $this->userEmail = $attributes['userEmail'] ?? '';
        $this->priceCents = $attributes['priceCents'] ?? 0;
        $this->qrHallKey = $attributes['qrHallKey'] ?? '';
        $this->qrCandyToken = $attributes['qrCandyToken'] ?? null;
        $this->status = $attributes['status'] ?? 'ISSUED';
        $this->candyComboDetails = $attributes['candyComboDetails'] ?? null;
        $this->candyRedeemed = $attributes['candyRedeemed'] ?? false;
        $this->candyRedemptionAudit = $attributes['candyRedemptionAudit'] ?? null;
        $this->createdAt = $attributes['createdAt'] ?? gmdate('Y-m-d\TH:i:s\Z');
        $this->updatedAt = $attributes['updatedAt'] ?? gmdate('Y-m-d\TH:i:s\Z');
    }

    public function canRedeemCandy(): bool
    {
        return !$this->candyRedeemed && !empty($this->candyComboDetails) && $this->status === 'ISSUED';
    }

    /**
     * RB-03.3: Bloqueo atómico contra doble canje de confitería y registro de auditoría.
     */
    public function markCandyAsRedeemed(string $cashierId, string $counterId = 'CAJA-01', string $ip = '127.0.0.1'): void
    {
        if ($this->candyRedeemed) {
            throw new \DomainException(
                "ADVERTENCIA DE DUPLICIDAD: Este combo ya fue canjeado previamente el " .
                ($this->candyRedemptionAudit['redeemedAtUtc'] ?? 'momento no registrado') .
                " por el cajero ID " . ($this->candyRedemptionAudit['cashierId'] ?? 'desconocido') . "."
            );
        }

        if (empty($this->candyComboDetails)) {
            throw new \DomainException("Este boleto no incluye ningún combo o beneficio de confitería canjeable.");
        }

        $nowUtc = gmdate('Y-m-d\TH:i:s\Z');
        $this->candyRedeemed = true;
        $this->candyRedemptionAudit = [
            'cashierId' => $cashierId,
            'redeemedAtUtc' => $nowUtc,
            'counterId' => $counterId,
            'terminalIp' => $ip,
            'comboName' => $this->candyComboDetails['name'] ?? 'Combo Dúo Clásico',
            'status' => 'REDEEMED_SUCCESS'
        ];
        $this->updatedAt = $nowUtc;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'ticketCode' => $this->ticketCode,
            'showtimeId' => $this->showtimeId,
            'hallName' => $this->hallName,
            'movieTitle' => $this->movieTitle,
            'seatCode' => $this->seatCode,
            'userId' => $this->userId,
            'userEmail' => $this->userEmail,
            'priceCents' => $this->priceCents,
            'qrHallKey' => $this->qrHallKey,
            'qrCandyToken' => $this->qrCandyToken,
            'status' => $this->status,
            'candyComboDetails' => $this->candyComboDetails,
            'candyRedeemed' => $this->candyRedeemed,
            'candyRedemptionAudit' => $this->candyRedemptionAudit,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
