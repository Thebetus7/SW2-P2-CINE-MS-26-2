package com.cinecenter.ticketing.domain;

import java.time.Instant;
import java.util.Objects;

/**
 * Representa la retención temporal de un asiento en DynamoDB (PLAN-10, RB-02.1).
 * Invariante: TTL estricto de 60 segundos.
 */
public class SeatHold {
    private final String showtimeId;
    private final String seatCode;
    private final String userId;
    private final long heldAtEpochSeconds;
    private final long ttlEpochSeconds; // Expiración exacta de 60s
    private String status; // "HELD", "PURCHASED", "RELEASED"

    public static final int HOLD_DURATION_SECONDS = 60;

    public SeatHold(String showtimeId, String seatCode, String userId, long heldAtEpochSeconds) {
        this.showtimeId = Objects.requireNonNull(showtimeId, "showtimeId no puede ser nulo");
        this.seatCode = Objects.requireNonNull(seatCode, "seatCode no puede ser nulo");
        this.userId = Objects.requireNonNull(userId, "userId no puede ser nulo");
        this.heldAtEpochSeconds = heldAtEpochSeconds;
        this.ttlEpochSeconds = heldAtEpochSeconds + HOLD_DURATION_SECONDS;
        this.status = "HELD";
    }

    public boolean isExpired(long currentEpochSeconds) {
        return currentEpochSeconds >= this.ttlEpochSeconds && !"PURCHASED".equals(this.status);
    }

    public long getRemainingSeconds(long currentEpochSeconds) {
        long remaining = this.ttlEpochSeconds - currentEpochSeconds;
        return Math.max(0, remaining);
    }

    public void markAsPurchased() {
        this.status = "PURCHASED";
    }

    public void release() {
        this.status = "RELEASED";
    }

    public String getShowtimeId() { return showtimeId; }
    public String getSeatCode() { return seatCode; }
    public String getUserId() { return userId; }
    public long getHeldAtEpochSeconds() { return heldAtEpochSeconds; }
    public long getTtlEpochSeconds() { return ttlEpochSeconds; }
    public String getStatus() { return status; }
}
