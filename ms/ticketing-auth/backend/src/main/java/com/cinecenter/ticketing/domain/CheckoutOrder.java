package com.cinecenter.ticketing.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Orden de compra en taquilla con soporte para idempotencia y orquestación SAGA (PLAN-12, RB-02.3).
 */
public class CheckoutOrder {
    private final String orderId;
    private final String idempotencyKey;
    private final String userId;
    private final String userEmail;
    private final String showtimeId;
    private final List<String> seatCodes;
    private final int ticketsPriceCents;
    private final String candyComboName;
    private final int candyPriceCents;
    private final int totalPriceCents;
    private String paymentStatus; // "PENDING", "PAID", "FAILED", "REFUNDED"
    private String sagaStatus;    // "NOT_STARTED", "PROCESSING", "COMPLETED", "COMPENSATED"
    private String stripeChargeId;

    public CheckoutOrder(
            String orderId,
            String idempotencyKey,
            String userId,
            String userEmail,
            String showtimeId,
            List<String> seatCodes,
            int ticketsPriceCents,
            String candyComboName,
            int candyPriceCents
    ) {
        this.orderId = Objects.requireNonNull(orderId, "orderId es requerido");
        this.idempotencyKey = Objects.requireNonNull(idempotencyKey, "idempotencyKey es requerida");
        this.userId = Objects.requireNonNull(userId, "userId es requerido");
        this.userEmail = Objects.requireNonNull(userEmail, "userEmail es requerido");
        this.showtimeId = Objects.requireNonNull(showtimeId, "showtimeId es requerido");
        this.seatCodes = new ArrayList<>(Objects.requireNonNull(seatCodes, "seatCodes es requerido"));
        this.ticketsPriceCents = ticketsPriceCents;
        this.candyComboName = candyComboName;
        this.candyPriceCents = candyPriceCents;
        this.totalPriceCents = ticketsPriceCents + candyPriceCents;
        this.paymentStatus = "PENDING";
        this.sagaStatus = "NOT_STARTED";
    }

    public void markAsPaid(String stripeChargeId) {
        this.paymentStatus = "PAID";
        this.stripeChargeId = stripeChargeId;
        this.sagaStatus = "PROCESSING";
    }

    public void markPaymentFailed() {
        this.paymentStatus = "FAILED";
    }

    public void completeSaga() {
        this.sagaStatus = "COMPLETED";
    }

    public void compensateRefund() {
        this.paymentStatus = "REFUNDED";
        this.sagaStatus = "COMPENSATED";
    }

    public String getOrderId() { return orderId; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public String getUserId() { return userId; }
    public String getUserEmail() { return userEmail; }
    public String getShowtimeId() { return showtimeId; }
    public List<String> getSeatCodes() { return Collections.unmodifiableList(seatCodes); }
    public int getTicketsPriceCents() { return ticketsPriceCents; }
    public String getCandyComboName() { return candyComboName; }
    public int getCandyPriceCents() { return candyPriceCents; }
    public int getTotalPriceCents() { return totalPriceCents; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getSagaStatus() { return sagaStatus; }
    public String getStripeChargeId() { return stripeChargeId; }
}
