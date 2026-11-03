package com.cinecenter.ticketing.application;

import com.cinecenter.ticketing.domain.CheckoutOrder;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Caso de Uso: Checkout Idempotente y Cobro con Resiliencia (PLAN-12, RB-02.2, RB-02.3).
 */
public class CheckoutUseCase {

    private final HoldSeatsUseCase holdSeatsUseCase;
    private final StripeGateway stripeGateway;
    private final SagaOrchestrator sagaOrchestrator;

    // Almacenamiento en memoria para pedidos e idempotencia
    private final Map<String, CheckoutOrder> ordersByIdempotencyKey = new ConcurrentHashMap<>();

    public static class CheckoutResult {
        public final boolean success;
        public final CheckoutOrder order;
        public final String message;
        public final boolean isDuplicateRequest;

        public CheckoutResult(boolean success, CheckoutOrder order, String message, boolean isDuplicateRequest) {
            this.success = success;
            this.order = order;
            this.message = message;
            this.isDuplicateRequest = isDuplicateRequest;
        }
    }

    public CheckoutUseCase(
            HoldSeatsUseCase holdSeatsUseCase,
            StripeGateway stripeGateway,
            SagaOrchestrator sagaOrchestrator
    ) {
        this.holdSeatsUseCase = Objects.requireNonNull(holdSeatsUseCase);
        this.stripeGateway = Objects.requireNonNull(stripeGateway);
        this.sagaOrchestrator = Objects.requireNonNull(sagaOrchestrator);
    }

    /**
     * RB-02.3: Ejecuta checkout garantizando idempotencia estricta por Idempotency-Key.
     * RB-02.2: Ante rechazo de pago, los asientos NO se liberan inmediatamente, manteniendo el TTL restante.
     */
    public synchronized CheckoutResult processCheckout(
            String idempotencyKey,
            String orderId,
            String userId,
            String userEmail,
            String showtimeId,
            List<String> seatCodes,
            int ticketsPriceCents,
            String candyComboName,
            int candyPriceCents,
            String paymentToken,
            long currentEpochSeconds
    ) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            throw new IllegalArgumentException("La cabecera Idempotency-Key es obligatoria.");
        }

        // 1. Detección de idempotencia
        CheckoutOrder existingOrder = ordersByIdempotencyKey.get(idempotencyKey);
        if (existingOrder != null) {
            if ("PAID".equals(existingOrder.getPaymentStatus())) {
                return new CheckoutResult(
                        true,
                        existingOrder,
                        "Pedido ya procesado anteriormente (Respuesta Idempotente).",
                        true
                );
            }
        }

        // 2. Validar que los asientos sigan válidamente retenidos por este usuario
        boolean holdsActive = holdSeatsUseCase.validateUserHoldsActive(showtimeId, seatCodes, userId, currentEpochSeconds);
        if (!holdsActive) {
            throw new IllegalStateException("La retención de asientos ha expirado o no pertenece al usuario.");
        }

        CheckoutOrder order = new CheckoutOrder(
                orderId,
                idempotencyKey,
                userId,
                userEmail,
                showtimeId,
                seatCodes,
                ticketsPriceCents,
                candyComboName,
                candyPriceCents
        );

        // 3. Procesar cobro con Stripe
        StripeGateway.ChargeResult chargeResult = stripeGateway.processPayment(
                paymentToken,
                order.getTotalPriceCents(),
                idempotencyKey
        );

        if (!chargeResult.success) {
            order.markPaymentFailed();
            ordersByIdempotencyKey.put(idempotencyKey, order);
            // RB-02.2: No liberamos asientos; el usuario conserva su tiempo restante para reintentar.
            return new CheckoutResult(
                    false,
                    order,
                    "Cobro rechazado: " + chargeResult.errorMessage + ". Sus asientos continúan retenidos temporalmente.",
                    false
            );
        }

        // 4. Pago exitoso: Marcar orden y proceder a SAGA
        order.markAsPaid(chargeResult.chargeId);
        ordersByIdempotencyKey.put(idempotencyKey, order);

        // 5. Orquestación SAGA de tickets y confirmación
        boolean sagaSuccess = sagaOrchestrator.executeSaga(order);

        if (!sagaSuccess) {
            return new CheckoutResult(
                    false,
                    order,
                    "Error al emitir boletos digitales. Se procesó el reembolso automático y liberación de butacas.",
                    false
            );
        }

        return new CheckoutResult(
                true,
                order,
                "Compra y emisión de boletos completada exitosamente.",
                false
        );
    }

    public CheckoutOrder getOrderByKey(String idempotencyKey) {
        return ordersByIdempotencyKey.get(idempotencyKey);
    }

    public void clear() {
        ordersByIdempotencyKey.clear();
    }
}
