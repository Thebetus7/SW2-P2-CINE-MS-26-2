import React from 'react';

export interface ContingencyBannerProps {
  isVisible: boolean;
  message?: string;
}

export const ContingencyBanner: React.FC<ContingencyBannerProps> = ({
  isVisible,
  message = 'Aviso: El servicio opera en modo contingencia offline/resiliente.',
}) => {
  if (!isVisible) return null;

  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-amber-300 text-xs text-center font-medium flex items-center justify-center space-x-2">
      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      <span>{message}</span>
    </div>
  );
};
