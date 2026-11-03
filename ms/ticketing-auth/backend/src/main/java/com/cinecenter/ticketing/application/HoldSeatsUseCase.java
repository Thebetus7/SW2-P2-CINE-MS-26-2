package com.cinecenter.ticketing.application;

import com.cinecenter.ticketing.domain.SeatHold;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Caso de Uso: Retención temporal de asientos con TTL estricto de 60 segundos (PLAN-10, RB-02.1).
 */
public class HoldSeatsUseCase {

    // Simulación del repositorio DynamoDB con llave compuesta showtimeId#seatCode
    private final Map<String, SeatHold> seatHoldRepository = new ConcurrentHashMap<>();

    public static class HoldResult {
        public final boolean success;
        public final List<String> heldSeats;
        public final long expiresAtEpochSeconds;
        public final long remainingSeconds;
        public final String message;

        public HoldResult(boolean success, List<String> heldSeats, long expiresAtEpochSeconds, long remainingSeconds, String message) {
            this.success = success;
            this.heldSeats = heldSeats;
            this.expiresAtEpochSeconds = expiresAtEpochSeconds;
            this.remainingSeconds = remainingSeconds;
            this.message = message;
        }
    }

    /**
     * RB-02.1: Retiene temporalmente una lista de asientos para un usuario durante 60 segundos.
     * Si algún asiento está ocupado por otro usuario y su TTL no ha vencido, la operación es rechazada de forma atómica.
     */
    public synchronized HoldResult holdSeats(String showtimeId, List<String> seatCodes, String userId, long currentEpochSeconds) {
        if (seatCodes == null || seatCodes.isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar al menos un asiento.");
        }

        // Paso 1: Validar disponibilidad de TODOS los asientos solicitados
        for (String seatCode : seatCodes) {
            String key = makeKey(showtimeId, seatCode);
            SeatHold existing = seatHoldRepository.get(key);

            if (existing != null) {
                if ("PURCHASED".equals(existing.getStatus())) {
                    throw new IllegalStateException("El asiento " + seatCode + " ya ha sido comprado definitivamente.");
                }
                // Si está retenido y NO ha expirado y pertenece a otro usuario
                if (!existing.isExpired(currentEpochSeconds) && !existing.getUserId().equals(userId)) {
                    throw new IllegalStateException("CONFLICTO CONCURRENTE: El asiento " + seatCode + " está temporalmente retenido por otro cliente.");
                }
            }
        }

        // Paso 2: Aplicar retención atómica de 60 segundos a todos los asientos
        List<String> confirmedSeats = new ArrayList<>();
        long expirationEpoch = currentEpochSeconds + SeatHold.HOLD_DURATION_SECONDS;

        for (String seatCode : seatCodes) {
            String key = makeKey(showtimeId, seatCode);
            SeatHold hold = new SeatHold(showtimeId, seatCode, userId, currentEpochSeconds);
            seatHoldRepository.put(key, hold);
            confirmedSeats.add(seatCode);
        }

        return new HoldResult(
                true,
                confirmedSeats,
                expirationEpoch,
                SeatHold.HOLD_DURATION_SECONDS,
                "Asientos retenidos exitosamente durante 60 segundos."
        );
    }

    /**
     * Verifica si una lista de asientos pertenece al usuario y su retención sigue vigente
     */
    public boolean validateUserHoldsActive(String showtimeId, List<String> seatCodes, String userId, long currentEpochSeconds) {
        for (String seatCode : seatCodes) {
            String key = makeKey(showtimeId, seatCode);
            SeatHold hold = seatHoldRepository.get(key);
            if (hold == null) return false;
            if (!hold.getUserId().equals(userId)) return false;
            if (hold.isExpired(currentEpochSeconds)) return false;
        }
        return true;
    }

    /**
     * Marca los asientos como comprados definitivamente tras el éxito de pago
     */
    public synchronized void confirmPurchase(String showtimeId, List<String> seatCodes) {
        for (String seatCode : seatCodes) {
            String key = makeKey(showtimeId, seatCode);
            SeatHold hold = seatHoldRepository.get(key);
            if (hold != null) {
                hold.markAsPurchased();
            }
        }
    }

    /**
     * Libera los asientos manualmente o por acción compensatoria
     */
    public synchronized void releaseSeats(String showtimeId, List<String> seatCodes) {
        for (String seatCode : seatCodes) {
            String key = makeKey(showtimeId, seatCode);
            SeatHold hold = seatHoldRepository.get(key);
            if (hold != null && !"PURCHASED".equals(hold.getStatus())) {
                seatHoldRepository.remove(key);
            }
        }
    }

    /**
     * Consulta el estado de todos los asientos de una función para el renderizado del mapa 2D
     */
    public Map<String, String> getSeatStatuses(String showtimeId, long currentEpochSeconds) {
        Map<String, String> statuses = new HashMap<>();
        for (Map.Entry<String, SeatHold> entry : seatHoldRepository.entrySet()) {
            if (entry.getKey().startsWith(showtimeId + "#")) {
                SeatHold hold = entry.getValue();
                if ("PURCHASED".equals(hold.getStatus())) {
                    statuses.put(hold.getSeatCode(), "OCCUPIED");
                } else if (!hold.isExpired(currentEpochSeconds)) {
                    statuses.put(hold.getSeatCode(), "HELD");
                } else {
                    statuses.put(hold.getSeatCode(), "AVAILABLE");
                }
            }
        }
        return statuses;
    }

    private String makeKey(String showtimeId, String seatCode) {
        return showtimeId + "#" + seatCode;
    }

    public void clear() {
        seatHoldRepository.clear();
    }
}
