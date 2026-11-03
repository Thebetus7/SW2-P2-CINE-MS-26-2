import React from 'react';

export interface HealthIndicatorProps {
  status: 'UP' | 'DOWN';
  serviceName: string;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ status, serviceName }) => {
  const isUp = status === 'UP';
  return (
    <div className="flex items-center space-x-2 text-xs font-mono">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          isUp ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
        }`}
      />
      <span className="text-zinc-300">{serviceName}:</span>
      <span className={isUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
        {status}
      </span>
    </div>
  );
};
