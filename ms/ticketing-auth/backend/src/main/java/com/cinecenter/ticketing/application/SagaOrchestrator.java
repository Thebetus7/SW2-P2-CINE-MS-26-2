package com.cinecenter.ticketing.application;

import com.cinecenter.ticketing.domain.CheckoutOrder;

import java.util.Objects;

/**
 * Coordinador de la máquina de estados SAGA y compensaciones transaccionales (PLAN-13, RB-02.4).
 */
public class SagaOrchestrator {

    public interface TicketServiceClient {
        boolean emitDigitalTickets(CheckoutOrder order);
    }

    private final StripeGateway stripeGateway;
    private final HoldSeatsUseCase holdSeatsUseCase;
    private final TicketServiceClient ticketServiceClient;

    public SagaOrchestrator(
            StripeGateway stripeGateway,
            HoldSeatsUseCase holdSeatsUseCase,
            TicketServiceClient ticketServiceClient
    ) {
        this.stripeGateway = Objects.requireNonNull(stripeGateway);
        this.holdSeatsUseCase = Objects.requireNonNull(holdSeatsUseCase);
        this.ticketServiceClient = Objects.requireNonNull(ticketServiceClient);
    }

    /**
     * RB-02.4: Ejecuta la SAGA de emisión distribuida o gatilla la compensación automática ante fallo externo.
     */
    public boolean executeSaga(CheckoutOrder order) {
        if (!"PAID".equals(order.getPaymentStatus())) {
            throw new IllegalStateException("No se puede iniciar la SAGA si el pago no está completado.");
        }

        // Paso 1: Asegurar compra definitiva de butacas
        holdSeatsUseCase.confirmPurchase(order.getShowtimeId(), order.getSeatCodes());

        // Paso 2: Invocar la emisión de boletos y QR Llave en el servicio multimedia
        boolean emissionSuccess = ticketServiceClient.emitDigitalTickets(order);

        if (emissionSuccess) {
            order.completeSaga();
            return true;
        }

        // ACCIÓN COMPENSATORIA (SAGA Rollback):
        // 1. Reembolsar automáticamente el cargo al cliente en Stripe
        stripeGateway.refundPayment(order.getStripeChargeId(), order.getTotalPriceCents());

        // 2. Liberar las butacas para que vuelvan a estar disponibles
        holdSeatsUseCase.releaseSeats(order.getShowtimeId(), order.getSeatCodes());

        // 3. Marcar orden como compensada
        order.compensateRefund();
        return false;
    }
}
