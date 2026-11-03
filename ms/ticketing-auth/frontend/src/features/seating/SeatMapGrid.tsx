import React, { useState } from 'react';
import { SeatMapModel, SeatItem, SeatStatus } from '../../components/SeatMapGrid.js';

export interface SeatMapGridProps {
  onSelectionChange?: (selectedSeats: string[]) => void;
  maxSeats?: number;
}

export const SeatMapGrid: React.FC<SeatMapGridProps> = ({ onSelectionChange, maxSeats = 8 }) => {
  const [seats, setSeats] = useState<SeatItem[]>(() => SeatMapModel.generateHallLayout());
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSeatClick = (code: string) => {
    const res = SeatMapModel.toggleSeat(seats, code, selectedCodes, maxSeats);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    setErrorMsg(null);
    setSeats(res.updatedSeats);
    setSelectedCodes(res.selectedCodes);
    if (onSelectionChange) onSelectionChange(res.selectedCodes);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-100 font-sans">
      <div className="text-center mb-6">
        <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded shadow-[0_0_15px_rgba(245,158,11,0.5)] mb-2" />
        <span className="text-xs tracking-widest text-zinc-400 uppercase font-mono">PANTALLA PROYECCIÓN</span>
      </div>

      {errorMsg && (
        <div className="mb-4 text-center text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2 rounded">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-10 gap-2 max-w-lg mx-auto">
        {seats.map((seat) => {
          let bgClass = 'bg-zinc-800 border-zinc-700 hover:border-amber-400 text-zinc-300';
          if (seat.status === 'SELECTED') bgClass = 'bg-amber-500 border-amber-400 text-zinc-950 font-bold';
          if (seat.status === 'PURCHASED') bgClass = 'bg-zinc-800/40 border-zinc-800 text-zinc-600 cursor-not-allowed';
          if (seat.status === 'HELD_OTHER') bgClass = 'bg-rose-900/40 border-rose-800 text-rose-400 cursor-not-allowed';

          return (
            <button
              key={seat.code}
              onClick={() => handleSeatClick(seat.code)}
              disabled={seat.status === 'PURCHASED' || seat.status === 'HELD_OTHER'}
              className={`h-9 rounded border text-xs font-mono transition flex items-center justify-center ${bgClass}`}
            >
              {seat.code}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-zinc-400">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-amber-500 border border-amber-400" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-zinc-800/40 border border-zinc-800" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
};
