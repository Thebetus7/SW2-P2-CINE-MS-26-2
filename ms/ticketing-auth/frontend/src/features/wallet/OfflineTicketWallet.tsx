import React, { useState } from 'react';
import { DigitalTicketWalletItem, OfflineTicketWalletModel } from '../../views/OfflineTicketWallet.js';
import { TicketDetailModal } from './TicketDetailModal.js';

export const OfflineTicketWallet: React.FC = () => {
  const [tickets] = useState<DigitalTicketWalletItem[]>(OfflineTicketWalletModel.getSampleWallet());
  const [activeTicket, setActiveTicket] = useState<DigitalTicketWalletItem | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Mis Boletos Digitales</h2>
            <p className="text-xs text-zinc-400 mt-1">Billetera offline con doble código QR in-app</p>
          </div>
          <a href="/" className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded transition">
            Volver a Cartelera
          </a>
        </div>

        <div className="space-y-4">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTicket(t)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-amber-400/50 cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-amber-400">
                    {t.ticketCode}
                  </span>
                  <span className="text-xs text-zinc-400">{t.showtime}</span>
                </div>
                <h3 className="text-base font-bold text-zinc-100 mt-1">{t.movieTitle}</h3>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {t.hallName} • Butaca {t.seatCode}
                </div>
                {t.candyComboName && (
                  <div className="text-xs text-amber-300 mt-2 font-medium">
                    🍿 Incluye: {t.candyComboName}
                  </div>
                )}
              </div>

              <div className="text-right">
                <button className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition">
                  Ver QR In-App
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TicketDetailModal
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
      />
    </div>
  );
};
