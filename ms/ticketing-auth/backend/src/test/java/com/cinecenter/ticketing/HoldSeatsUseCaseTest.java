package com.cinecenter.ticketing;

import com.cinecenter.ticketing.application.HoldSeatsUseCase;
import com.cinecenter.ticketing.domain.SeatHold;

import java.util.List;

public class HoldSeatsUseCaseTest {

    public static void run() {
        System.out.println("  [RUNNING] HoldSeatsUseCaseTest (TTL 60s & Concurrency)...");
        testSuccessfulHoldWith60SecondTtl();
        testRejectConcurrentHoldByAnotherUser();
        testAllowHoldAfterTtlExpiration();
        testRejectHoldOnPurchasedSeat();
        System.out.println("  PASS: HoldSeatsUseCaseTest completado exitosamente (4/4 casos verificados).");
    }

    private static void testSuccessfulHoldWith60SecondTtl() {
        HoldSeatsUseCase useCase = new HoldSeatsUseCase();
        long now = 1700000000L;

        HoldSeatsUseCase.HoldResult result = useCase.holdSeats("shw-01", List.of("C-1", "C-2"), "user-ana", now);

        if (!result.success) throw new AssertionError("Hold debe ser exitoso");
        if (result.heldSeats.size() != 2) throw new AssertionError("Deben retenerse 2 asientos");
        if (result.remainingSeconds != 60) throw new AssertionError("TTL debe ser de exactamente 60 segundos");
        if (result.expiresAtEpochSeconds != now + 60) throw new AssertionError("Expiración debe ser now + 60s");
    }

    private static void testRejectConcurrentHoldByAnotherUser() {
        HoldSeatsUseCase useCase = new HoldSeatsUseCase();
        long now = 1700000000L;

        useCase.holdSeats("shw-01", List.of("D-5"), "user-ana", now);

        boolean caught = false;
        try {
            // Intento por otro usuario a los 30 segundos (dentro de la ventana de 60s)
            useCase.holdSeats("shw-01", List.of("D-5"), "user-carlos", now + 30);
        } catch (IllegalStateException e) {
            caught = true;
            if (!e.getMessage().contains("CONFLICTO CONCURRENTE")) {
                throw new AssertionError("Mensaje debe advertir conflicto concurrente");
            }
        }

        if (!caught) throw new AssertionError("Debe rechazar la retención concurrente de otro usuario");
    }

    private static void testAllowHoldAfterTtlExpiration() {
        HoldSeatsUseCase useCase = new HoldSeatsUseCase();
        long now = 1700000000L;

        useCase.holdSeats("shw-01", List.of("E-8"), "user-ana", now);

        // A los 61 segundos la retención de Ana ya expiró
        HoldSeatsUseCase.HoldResult result = useCase.holdSeats("shw-01", List.of("E-8"), "user-carlos", now + 61);

        if (!result.success) throw new AssertionError("Carlos debe poder retener el asiento expirado");
        if (!result.heldSeats.contains("E-8")) throw new AssertionError("E-8 debe estar en la lista de retenidos de Carlos");
    }

    private static void testRejectHoldOnPurchasedSeat() {
        HoldSeatsUseCase useCase = new HoldSeatsUseCase();
        long now = 1700000000L;

        useCase.holdSeats("shw-01", List.of("A-1"), "user-ana", now);
        useCase.confirmPurchase("shw-01", List.of("A-1"));

        boolean caught = false;
        try {
            // Incluso después de 1000 segundos, el asiento comprado no puede retenerse
            useCase.holdSeats("shw-01", List.of("A-1"), "user-carlos", now + 1000);
        } catch (IllegalStateException e) {
            caught = true;
            if (!e.getMessage().contains("comprado definitivamente")) {
                throw new AssertionError("Debe informar que ya fue comprado definitivamente");
            }
        }

        if (!caught) throw new AssertionError("Asiento comprado nunca debe poder retenerse");
    }
}
