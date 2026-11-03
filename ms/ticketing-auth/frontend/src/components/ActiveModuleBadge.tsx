import React from 'react';

export const ActiveModuleBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs font-mono">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      <span>ms/ticketing-auth (Puerto 3000 - AWS)</span>
    </div>
  );
};
