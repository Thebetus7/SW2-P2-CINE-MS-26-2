import React, { useState } from 'react';
import { LoginViewModel } from '../../views/LoginView.js';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = LoginViewModel.authenticate(email, password);
      // Redirección inteligente según el rol autenticado (INV-BIZ-05)
      window.location.href = session.redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Error al autenticar');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-zinc-950 text-lg">
            CC
          </div>
          <h2 className="text-xl font-bold tracking-tight">Acceso Unificado</h2>
          <p className="text-xs text-zinc-400 mt-1">Clientes, Cajeros y Administradores</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@test.com"
              required
              className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition"
          >
            Ingresar al Portal
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
          <a href="/" className="text-xs text-zinc-400 hover:text-zinc-200 transition">
            ← Volver a la Cartelera Pública
          </a>
        </div>
      </div>
    </div>
  );
};
