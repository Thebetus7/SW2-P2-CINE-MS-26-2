import React, { useEffect, useState } from 'react';
import { CircularHoldTimerModel } from '../../components/SeatMapGrid.js';

export interface CircularHoldTimerProps {
  initialSeconds?: number;
  onExpired?: () => void;
}

export const CircularHoldTimer: React.FC<CircularHoldTimerProps> = ({
  initialSeconds = 60,
  onExpired,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (onExpired) onExpired();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpired) onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onExpired]);

  const { percentage, colorTheme, isExpired } = CircularHoldTimerModel.calculateProgress(secondsRemaining);

  let strokeColor = '#10b981'; // green (emerald)
  if (colorTheme === 'amber') strokeColor = '#f59e0b';
  if (colorTheme === 'red_pulse') strokeColor = '#ef4444';

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#27272a"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span
          className={`absolute text-xs font-mono font-bold ${
            colorTheme === 'red_pulse' ? 'text-rose-500 animate-pulse' : 'text-zinc-200'
          }`}
        >
          {secondsRemaining}s
        </span>
      </div>

      <div>
        <div className="text-xs font-semibold text-zinc-200">
          {isExpired ? 'Tiempo expirado' : 'Asientos retenidos'}
        </div>
        <div className="text-[11px] text-zinc-400">
          {isExpired ? 'Las butacas fueron liberadas' : 'Completa tu compra antes de 60s'}
        </div>
      </div>
    </div>
  );
};
