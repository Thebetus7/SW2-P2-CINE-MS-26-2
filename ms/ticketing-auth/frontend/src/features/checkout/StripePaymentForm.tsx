import React, { useState } from 'react';
import { CartPaymentModel } from '../../views/CartView.js';

export interface StripePaymentFormProps {
  grandTotalCents: number;
  idempotencyKey: string;
  onPaymentSuccess: (chargeId: string) => void;
  onPaymentFailure: (errorMessage: string, retainSeats: boolean) => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  grandTotalCents,
  idempotencyKey,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expDate, setExpDate] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      const result = CartPaymentModel.simulateCardCharge(cleanCard, idempotencyKey);

      if (result.success && result.chargeId) {
        onPaymentSuccess(result.chargeId);
      } else {
        onPaymentFailure(
          result.errorMessage || 'Error de procesamiento de tarjeta',
          result.retainSeats
        );
      }
    } catch (err: any) {
      onPaymentFailure(err.message, true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-100 font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <span className="text-xs font-semibold text-zinc-300">Stripe Elements Sandbox</span>
        <span className="text-[11px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-amber-400">
          Clave Idempotente: {idempotencyKey.substring(0, 16)}...
        </span>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Número de Tarjeta de Prueba</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="4242 4242 4242 4242"
          className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
          required
        />
        <span className="text-[11px] text-zinc-500 mt-1 block">
          * Para probar rechazo de fondos y retención (RB-02.2), use tarjeta que termine en 0002.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Vencimiento</label>
          <input
            type="text"
            value={expDate}
            onChange={(e) => setExpDate(e.target.value)}
            placeholder="MM/AA"
            className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">CVC</label>
          <input
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            placeholder="123"
            className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-bold text-sm transition"
      >
        {isProcessing ? 'Procesando Pago Seguro...' : `Pagar Bs ${(grandTotalCents / 100).toFixed(2)}`}
      </button>
    </form>
  );
};
