package com.cinecenter.ticketing.application;

/**
 * Puerto para la pasarela de pagos Stripe (PLAN-14, RB-02.3).
 */
public interface StripeGateway {
    class ChargeResult {
        public final boolean success;
        public final String chargeId;
        public final String errorMessage;

        public ChargeResult(boolean success, String chargeId, String errorMessage) {
            this.success = success;
            this.chargeId = chargeId;
            this.errorMessage = errorMessage;
        }

        public static ChargeResult ok(String chargeId) {
            return new ChargeResult(true, chargeId, null);
        }

        public static ChargeResult failure(String errorMessage) {
            return new ChargeResult(false, null, errorMessage);
        }
    }

    ChargeResult processPayment(String paymentToken, int amountCents, String idempotencyKey);
    boolean refundPayment(String chargeId, int amountCents);
}
