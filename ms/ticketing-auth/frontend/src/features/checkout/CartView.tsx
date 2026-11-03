import React, { useState } from 'react';
import { CartPaymentModel, CartState, CandyProduct } from '../../views/CartView.js';
import { StripePaymentForm } from './StripePaymentForm.js';

export interface CartViewProps {
  initialCart?: Partial<CartState>;
  onOrderCompleted?: (orderId: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({ initialCart, onOrderCompleted }) => {
  const [combos] = useState<CandyProduct[]>(CartPaymentModel.getAvailableCandyCombos());
  const [selectedCombo, setSelectedCombo] = useState<CandyProduct | undefined>(combos[0]);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const cart: CartState = {
    showtimeId: initialCart?.showtimeId || 'shw-101',
    movieTitle: initialCart?.movieTitle || 'Dune: Part Two (IMAX 3D)',
    seatCodes: initialCart?.seatCodes || ['C-4', 'C-5'],
    pricePerSeatCents: initialCart?.pricePerSeatCents || 4500,
    selectedCandy: selectedCombo,
    idempotencyKey: initialCart?.idempotencyKey || CartPaymentModel.generateIdempotencyKey('ord_client'),
  };

  const totals = CartPaymentModel.calculateTotals(cart);

  const handlePaymentSuccess = (chargeId: string) => {
    setPaymentStatus(`Pago exitoso confirmado. Cargo ID: ${chargeId}`);
    setPaymentError(null);
    if (onOrderCompleted) onOrderCompleted(chargeId);
  };

  const handlePaymentFailure = (errorMessage: string, retainSeats: boolean) => {
    setPaymentError(
      `${errorMessage} ${retainSeats ? '(Tus butacas continúan retenidas en tu carrito)' : ''}`
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resumen de Compra y Confitería</h2>
          <p className="text-xs text-zinc-400 mt-1">Revisa tus entradas y agrega combos con descuento</p>
        </div>

        {paymentError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-semibold">
            {paymentError}
          </div>
        )}

        {paymentStatus && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold">
            {paymentStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Entradas y Confitería */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-amber-400 mb-2">Entradas de Cine</h3>
              <div className="flex justify-between items-center text-sm">
                <span>{cart.movieTitle}</span>
                <span className="font-mono text-zinc-400">
                  {cart.seatCodes.length}x Bs {(cart.pricePerSeatCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Butacas seleccionadas: <span className="font-mono text-zinc-200">{cart.seatCodes.join(', ')}</span>
              </div>
              <div className="text-right mt-2 text-sm font-semibold">
                Subtotal: Bs {(totals.ticketsTotalCents / 100).toFixed(2)}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-amber-400 mb-2">Confitería Candy Bar (Opcional)</h3>
              <div className="space-y-2">
                {combos.map((c) => (
                  <label
                    key={c.id}
                    className={`block p-3 rounded-lg border cursor-pointer transition text-xs ${
                      selectedCombo?.id === c.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                        : 'bg-zinc-800/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="candyCombo"
                      checked={selectedCombo?.id === c.id}
                      onChange={() => setSelectedCombo(c)}
                      className="hidden"
                    />
                    <div className="flex justify-between font-bold">
                      <span>{c.name}</span>
                      <span>Bs {(c.priceCents / 100).toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{c.description}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-between items-center">
              <span className="text-base font-bold">Total a Pagar</span>
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                {totals.formattedTotal}
              </span>
            </div>
          </div>

          {/* Formulario Stripe */}
          <div>
            <StripePaymentForm
              grandTotalCents={totals.grandTotalCents}
              idempotencyKey={cart.idempotencyKey}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
