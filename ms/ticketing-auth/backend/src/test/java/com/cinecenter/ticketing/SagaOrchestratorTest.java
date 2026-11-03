package com.cinecenter.ticketing;

import com.cinecenter.ticketing.application.HoldSeatsUseCase;
import com.cinecenter.ticketing.application.SagaOrchestrator;
import com.cinecenter.ticketing.application.StripeGateway;
import com.cinecenter.ticketing.domain.CheckoutOrder;

import java.util.List;

public class SagaOrchestratorTest {

    public static void run() {
        System.out.println("  [RUNNING] SagaOrchestratorTest (Distributed SAGA & Compensation)...");
        testHappyPathSagaCompletion();
        testCompensatingTransactionOnDownstreamFailure();
        System.out.println("  PASS: SagaOrchestratorTest completado exitosamente (2/2 casos verificados).");
    }

    private static void testHappyPathSagaCompletion() {
        HoldSeatsUseCase holdUseCase = new HoldSeatsUseCase();
        holdUseCase.holdSeats("shw-01", List.of("H-1", "H-2"), "user-saga", 1000L);

        StripeGateway stripeMock = new StripeGateway() {
            @Override
            public ChargeResult processPayment(String t, int a, String k) { return ChargeResult.ok("ch_1"); }
            @Override
            public boolean refundPayment(String c, int a) { return true; }
        };

        // Servicio multimedia responde exitosamente
        SagaOrchestrator.TicketServiceClient ticketClientSuccess = order -> true;

        SagaOrchestrator orchestrator = new SagaOrchestrator(stripeMock, holdUseCase, ticketClientSuccess);

        CheckoutOrder order = new CheckoutOrder(
                "ord-saga-ok", "key-saga-1", "user-saga", "s@test.com", "shw-01", List.of("H-1", "H-2"), 7000, null, 0
        );
        order.markAsPaid("ch_1");

        boolean result = orchestrator.executeSaga(order);

        if (!result) throw new AssertionError("Saga debe completarse exitosamente");
        if (!"COMPLETED".equals(order.getSagaStatus())) throw new AssertionError("Estado SAGA debe ser COMPLETED");
    }

    private static void testCompensatingTransactionOnDownstreamFailure() {
        HoldSeatsUseCase holdUseCase = new HoldSeatsUseCase();
        holdUseCase.holdSeats("shw-01", List.of("H-3"), "user-fail", 1000L);

        boolean[] refundTriggered = {false};
        StripeGateway stripeMock = new StripeGateway() {
            @Override
            public ChargeResult processPayment(String t, int a, String k) { return ChargeResult.ok("ch_refund_target"); }
            @Override
            public boolean refundPayment(String c, int a) {
                refundTriggered[0] = true;
                return true;
            }
        };

        // Fallo simulado en el servicio downstream de emisión de tickets (ej. timeout de red)
        SagaOrchestrator.TicketServiceClient failingClient = order -> false;

        SagaOrchestrator orchestrator = new SagaOrchestrator(stripeMock, holdUseCase, failingClient);

        CheckoutOrder order = new CheckoutOrder(
                "ord-saga-fail", "key-saga-fail", "user-fail", "f@test.com", "shw-01", List.of("H-3"), 3500, null, 0
        );
        order.markAsPaid("ch_refund_target");

        boolean result = orchestrator.executeSaga(order);

        if (result) throw new AssertionError("Saga debe retornar false ante fallo aguas abajo");
        if (!refundTriggered[0]) throw new AssertionError("RB-02.4: Debe gatillar el reembolso automático en Stripe");
        if (!"REFUNDED".equals(order.getPaymentStatus())) throw new AssertionError("Estado de pago debe ser REFUNDED");
        if (!"COMPENSATED".equals(order.getSagaStatus())) throw new AssertionError("Estado SAGA debe ser COMPENSATED");
    }
}
