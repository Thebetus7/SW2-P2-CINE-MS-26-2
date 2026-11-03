export interface CandyProduct {
  id: string;
  name: string;
  description: string;
  priceCents: number;
}

export interface CartState {
  showtimeId: string;
  movieTitle: string;
  seatCodes: string[];
  pricePerSeatCents: number;
  selectedCandy?: CandyProduct;
  idempotencyKey: string;
}

export class CartPaymentModel {
  static getAvailableCandyCombos(): CandyProduct[] {
    return [
      {
        id: 'cnd-01',
        name: 'Combo Dúo Clásico',
        description: '2 Pipocas Medianas + 2 Gaseosas 500ml',
        priceCents: 2800,
      },
      {
        id: 'cnd-02',
        name: 'Combo Mega Familiar',
        description: '1 Pipoca Balde Gigante + 4 Bebidas + 1 Nachos con Queso',
        priceCents: 4500,
      },
    ];
  }

  static calculateTotals(cart: CartState): {
    ticketsTotalCents: number;
    candyTotalCents: number;
    grandTotalCents: number;
    formattedTotal: string;
  } {
    const ticketsTotalCents = cart.seatCodes.length * cart.pricePerSeatCents;
    const candyTotalCents = cart.selectedCandy ? cart.selectedCandy.priceCents : 0;
    const grandTotalCents = ticketsTotalCents + candyTotalCents;

    return {
      ticketsTotalCents,
      candyTotalCents,
      grandTotalCents,
      formattedTotal: `Bs ${(grandTotalCents / 100).toFixed(2)}`,
    };
  }

  /**
   * RB-02.3: Genera una clave de idempotencia única para la transacción
   */
  static generateIdempotencyKey(orderPrefix = 'ord'): string {
    return `${orderPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * RB-02.2: Procesa intento de cobro con tarjeta.
   * Si la tarjeta es declinada, preserva los asientos en el carrito.
   */
  static simulateCardCharge(
    cardNumber: string,
    idempotencyKey: string
  ): { success: boolean; chargeId?: string; errorMessage?: string; retainSeats: boolean } {
    if (!idempotencyKey) {
      throw new Error('Cabecera Idempotency-Key ausente');
    }

    // Simulación: tarjetas terminadas en 0002 se rechazan por fondos insuficientes
    if (cardNumber.endsWith('0002')) {
      return {
        success: false,
        errorMessage: 'Fondos insuficientes en la tarjeta.',
        retainSeats: true, // RB-02.2: No liberar asientos
      };
    }

    return {
      success: true,
      chargeId: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      retainSeats: false,
    };
  }
}
