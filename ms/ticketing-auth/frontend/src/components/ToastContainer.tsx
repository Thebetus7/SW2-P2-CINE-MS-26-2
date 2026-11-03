import React from 'react';

export interface ToastItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full font-sans">
      {toasts.map((toast) => {
        let borderClass = 'border-zinc-700 bg-zinc-900 text-zinc-100';
        if (toast.type === 'warning') borderClass = 'border-amber-500/50 bg-amber-950/80 text-amber-200';
        if (toast.type === 'error') borderClass = 'border-rose-500/50 bg-rose-950/80 text-rose-200';
        if (toast.type === 'success') borderClass = 'border-emerald-500/50 bg-emerald-950/80 text-emerald-200';

        return (
          <div
            key={toast.id}
            className={`p-3 rounded-lg border text-xs shadow-lg flex items-center justify-between ${borderClass}`}
          >
            <span>{toast.message}</span>
            {onDismiss && (
              <button
                onClick={() => onDismiss(toast.id)}
                className="ml-2 text-zinc-400 hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
