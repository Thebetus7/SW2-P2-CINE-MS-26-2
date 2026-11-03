package com.cinecenter.ticketing;

import com.cinecenter.ticketing.application.CheckoutUseCase;
import com.cinecenter.ticketing.application.HoldSeatsUseCase;
import com.cinecenter.ticketing.application.SagaOrchestrator;
import com.cinecenter.ticketing.application.StripeGateway;

import java.util.List;

public class CheckoutUseCaseTest {

    public static void run() {
        System.out.println("  [RUNNING] CheckoutUseCaseTest (Idempotency & Payment Resilience)...");
        testSuccessfulCheckoutAndPayment();
        testStrictIdempotency();
        testPaymentFailurePreservesSeatHolds();
        testRejectCheckoutWhenHoldsExpired();
        System.out.println("  PASS: CheckoutUseCaseTest completado exitosamente (4/4 casos verificados).");
    }

    private static void testSuccessfulCheckoutAndPayment() {
        HoldSeatsUseCase holdUseCase = new HoldSeatsUseCase();
        long now = 1700000000L;
        holdUseCase.holdSeats("shw-01", List.of("B-10"), "user-1", now);

        // Mock StripeGateway exitoso
        StripeGateway stripeMock = new StripeGateway() {
            @Override
            public ChargeResult processPayment(String token, int amount, String key) {
                return ChargeResult.ok("ch_stripe_test_12345");
            }
            @Override
            public boolean refundPayment(String chargeId, int amount) { return true; }
        };

        SagaOrchestrator sagaOrchestrator = new SagaOrchestrator(stripeMock, holdUseCase, order -> true);
        CheckoutUseCase checkoutUseCase = new CheckoutUseCase(holdUseCase, stripeMock, sagaOrchestrator);

        CheckoutUseCase.CheckoutResult result = checkoutUseCase.processCheckout(
                "idemp-key-001",
                "ord-001",
                "user-1",
                "user1@cinecenter.com",
                "shw-01",
                List.of("B-10"),
                3500,
                "Combo Popcorn",
                2500,
                "tok_visa_valid",
                now + 10
        );

        if (!result.success) throw new AssertionError("Checkout debe ser exitoso");
        if (result.order.getTotalPriceCents() != 6000) throw new AssertionError("Total debe ser 3500 + 2500 = 6000 cents");
        if (!"PAID".equals(result.order.getPaymentStatus())) throw new AssertionError("Estado de pago debe ser PAID");
        if (!"COMPLETED".equals(result.order.getSagaStatus())) throw new AssertionError("Saga debe completarse");
    }

    private static void testStrictIdempotency() {
        HoldSeatsUseCase holdUseCase = new HoldSeatsUseCase();
        long now = 1700000000L;
        holdUseCase.holdSeats("shw-01", List.of("B-11"), "user-2", now);

        int[] chargeCount = {0};
        StripeGateway stripeMock = new StripeGateway() {
            @Override
            public ChargeResult processPayment(String token, int amount, String key) {
                chargeCount[0]++;
                return ChargeResult.ok("ch_stripe_single_charge");
            }
            @Override
            public boolean refundPayment(String chargeId, int amount) { return true; }
        };

        SagaOrchestrator sagaOrchestrator = new SagaOrchestrator(stripeMock, holdUseCase, order -> true);
        CheckoutUseCase checkoutUseCase = new CheckoutUseCase(holdUseCase, stripeMock, sagaOrchestrator);

        // Primera llamada
        CheckoutUseCase.CheckoutResult res1 = checkoutUseCase.processCheckout(
                "idemp-duplicate-test", "ord-dup-1", "user-2", "u2@test.com", "shw-01", List.of("B-11"), 4000, null, 0, "tok_card", now + 5
        );
        // Segunda llamada idéntica con el mismo Idempotency-Key
        CheckoutUseCase.CheckoutResult res2 = checkoutUseCase.processCheckout(
                "idemp-duplicate-test", "ord-dup-1", "user-2", "u2@test.com", "shw-01", List.of("B-11"), 4000, null, 0, "tok_card", now + 6
        );

        if (!res1.success || !res2.success) throw new AssertionError("Ambas deben responder éxito");
        if (chargeCount[0] != 1) throw new AssertionError("Stripe SOLO debe ser llamado una vez (Idempotencia estricta)");
        if (!res2.isDuplicateRequest) throw new AssertionError("Segunda llamada debe ser marcada como isDuplicateRequest");
    }

    private static void testPaymentFailurePreservesSeatHolds() {
        HoldSeatsUseCase holdUseCase = new HoldSeatsUseCase();
        long now = 1700000000L;
        holdUseCase.holdSeats("shw-01", List.of("C-7"), "user-retry", now);

        // Stripe rechaza la tarjeta por fondos insuficientes
        StripeGateway stripeFailingMock = new StripeGateway() {
            @Override
            public ChargeResult processPayment(String token, int amount, String key) {
                return ChargeResult.failure("Tarjeta declinada: Fondos insuficientes");
            }
            @Override
            public boolean refundPayment(String chargeId, int amount) { return true; }
        };

        SagaOrchestrator saga = new SagaOrchestrator(stripeFailingMock, holdUseCase, order -> true);
        CheckoutUseCase checkoutUseCase = new CheckoutUseCase(holdUseCase, stripeFailingMock, saga);

        CheckoutUseCase.CheckoutResult result = checkoutUseCase.processCheckout(
                "idemp-fail-1", "ord-fail", "user-retry", "retry@test.com", "shw-01", List.of("C-7"), 3500, null, 0, "tok_declined", now + 20
        );

        if (result.success) throw new AssertionError("Checkout debe fallar con tarjeta declinada");
        // RB-02.2: Los asientos NO se liberan, el usuario mantiene la retención temporal
        boolean holdStillActive = holdUseCase.validateUserHoldsActive("shw-01", List.of("C-7"), "user-retry", now + 25);
        if (!holdStillActive) throw new AssertionError("RB-02.2: Los asientos deben mantenerse retenidos ante rechazo de pago");
    }

    private static void testRejectCheckoutWhenHoldsExpired() {
        HoldSeatsUseCase holdUseCase = new HoldSeatsUseCase();
        long now = 1700000000L;
        holdUseCase.holdSeats("shw-01", List.of("A-9"), "user-late", now);

        StripeGateway stripeMock = new StripeGateway() {
            @Override
            public ChargeResult processPayment(String t, int a, String k) { return ChargeResult.ok("ch_ok"); }
            @Override
            public boolean refundPayment(String c, int a) { return true; }
        };
        SagaOrchestrator saga = new SagaOrchestrator(stripeMock, holdUseCase, order -> true);
        CheckoutUseCase checkoutUseCase = new CheckoutUseCase(holdUseCase, stripeMock, saga);

        boolean caught = false;
        try {
            // Intento de checkout a los 65 segundos (retención de 60s ya expiró)
            checkoutUseCase.processCheckout(
                    "idemp-expired", "ord-late", "user-late", "late@test.com", "shw-01", List.of("A-9"), 3500, null, 0, "tok_ok", now + 65
            );
        } catch (IllegalStateException e) {
            caught = true;
            if (!e.getMessage().contains("ha expirado")) {
                throw new AssertionError("Mensaje debe advertir expiración");
            }
        }

        if (!caught) throw new AssertionError("Debe rechazar checkout si el TTL de retención ya expiró");
    }
}
