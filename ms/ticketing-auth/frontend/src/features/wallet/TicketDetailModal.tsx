import React from 'react';
import { DigitalTicketWalletItem, OfflineTicketWalletModel } from '../../views/OfflineTicketWallet.js';

export interface TicketDetailModalProps {
  ticket: DigitalTicketWalletItem | null;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const displayData = OfflineTicketWalletModel.getModalDisplayData(ticket);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 text-lg font-bold"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-semibold">
            Boleto Digital Oficial In-App
          </span>
          <h3 className="text-lg font-bold text-zinc-100 mt-1">{ticket.movieTitle}</h3>
          <p className="text-xs text-zinc-400">
            {ticket.hallName} • Butaca {ticket.seatCode} • {ticket.showtime}
          </p>
        </div>

        {/* Doble QR en Pantalla (INV-BIZ-03: Proyección In-App sin descarga) */}
        <div className="space-y-4">
          {/* QR Llave para Acceso a Sala */}
          <div className="bg-white rounded-xl p-4 text-zinc-950 text-center shadow">
            <div className="text-xs font-bold uppercase tracking-wide text-zinc-800 mb-1">
              [QR 1] LLAVE DE ACCESO A SALA (ACCESO SEGURO)
            </div>
            <div className="w-32 h-32 mx-auto bg-zinc-950 rounded flex items-center justify-center text-white font-mono text-[10px] p-2 break-all">
              {displayData.hallQrData.substring(0, 36)}...
            </div>
            <div className="text-[11px] text-zinc-600 mt-2 font-mono">
              Código: {ticket.ticketCode}
            </div>
          </div>

          {/* QR de Confitería Candy Bar si aplica */}
          {displayData.hasCandyVoucherQr && (
            <div className="bg-amber-400/90 rounded-xl p-4 text-zinc-950 text-center shadow">
              <div className="text-xs font-bold uppercase tracking-wide text-zinc-900 mb-1">
                [QR 2] VOUCHER DE CONFITERÍA CANDY BAR
              </div>
              <div className="w-24 h-24 mx-auto bg-zinc-950 rounded flex items-center justify-center text-amber-300 font-mono text-[10px] p-2 break-all">
                {displayData.candyQrData}
              </div>
              <div className="text-[11px] text-zinc-900 font-semibold mt-2">
                {ticket.candyComboName}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
          <p className="text-[11px] text-zinc-500">
            ⚡ Proyección in-app con máximo brillo óptico. No requiere descargar archivos a disco.
          </p>
        </div>
      </div>
    </div>
  );
};
