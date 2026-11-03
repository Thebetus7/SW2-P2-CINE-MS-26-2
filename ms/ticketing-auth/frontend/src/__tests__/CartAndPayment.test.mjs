import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CartPaymentModel } from '../views/CartView.ts';

describe('T4.3 [TEST] Cart, Totals & Payment Resilience', () => {
  test('debe calcular los totales de butacas y confitería unificada', () => {
    const cart = {
      showtimeId: 'shw-101',
      movieTitle: 'Dune: Part Two',
      seatCodes: ['C-1', 'C-2'], // 2 asientos a Bs 45.00
      pricePerSeatCents: 4500,
      selectedCandy: {
        id: 'cnd-01',
        name: 'Combo Dúo Clásico',
        description: '2 Pipocas + 2 Gaseosas',
        priceCents: 2800, // Bs 28.00
      },
      idempotencyKey: 'test_key',
    };

    const totals = CartPaymentModel.calculateTotals(cart);
    assert.equal(totals.ticketsTotalCents, 9000);
    assert.equal(totals.candyTotalCents, 2800);
    assert.equal(totals.grandTotalCents, 11800);
    assert.equal(totals.formattedTotal, 'Bs 118.00');
  });

  test('RB-02.3: debe generar clave de idempotencia única para cada orden', () => {
    const key1 = CartPaymentModel.generateIdempotencyKey();
    const key2 = CartPaymentModel.generateIdempotencyKey();
    assert.notEqual(key1, key2);
    assert.match(key1, /^ord_/);
  });

  test('RB-02.2: ante fallo de cobro por fondos insuficientes, los asientos se retienen', () => {
    const result = CartPaymentModel.simulateCardCharge('4000123456780002', 'idemp_key_fail');
    assert.equal(result.success, false);
    assert.match(result.errorMessage, /Fondos insuficientes/);
    assert.equal(result.retainSeats, true, 'RB-02.2: Debe conservar la retención de asientos para reintentar');
  });

  test('debe procesar cobro exitoso con tarjeta válida', () => {
    const result = CartPaymentModel.simulateCardCharge('4000123456781111', 'idemp_key_ok');
    assert.equal(result.success, true);
    assert.ok(result.chargeId);
    assert.equal(result.retainSeats, false);
  });
});
