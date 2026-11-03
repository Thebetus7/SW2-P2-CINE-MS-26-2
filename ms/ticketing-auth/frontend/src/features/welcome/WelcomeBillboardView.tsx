import React, { useState } from 'react';
import { HealthIndicator } from '../../components/HealthIndicator.js';
import { ContingencyBanner } from '../../components/ContingencyBanner.js';
import { WelcomeBillboardModel, MovieBillboardItem } from '../../views/WelcomeBillboardView.js';

export const WelcomeBillboardView: React.FC = () => {
  const [movies] = useState<MovieBillboardItem[]>(WelcomeBillboardModel.getSampleMovies());
  const health = WelcomeBillboardModel.getSystemHealth();
  const hasOutage = Object.values(health).some((status) => status === 'DOWN');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <ContingencyBanner isVisible={hasOutage} />

      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-zinc-950 text-sm">
            CC
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Cine Center Bolivia</h1>
            <p className="text-xs text-zinc-400">Portal de Taquilla Oficial — Puerto 3000</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <HealthIndicator status={health.ticketingAuth} serviceName="Ticketing" />
          <HealthIndicator status={health.cinemaCore} serviceName="Core" />
          <a
            href="/login"
            className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-1.5 rounded font-semibold transition"
          >
            Iniciar Sesión
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">Cartelera en Estreno</h2>
          <p className="text-sm text-zinc-400">Selecciona tu función favorita para comprar boletos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                    {movie.format}
                  </span>
                  <span className="text-xs text-zinc-400">{movie.durationMinutes} min</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-1">{movie.title}</h3>
                <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{movie.synopsis}</p>
              </div>

              <div>
                <div className="text-xs font-medium text-zinc-400 mb-2">Horarios disponibles:</div>
                <div className="flex flex-wrap gap-2">
                  {movie.showtimes.map((shw) => (
                    <a
                      key={shw.id}
                      href={`/cartelera?showtimeId=${shw.id}`}
                      className="text-xs px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-mono text-zinc-200 transition"
                    >
                      {shw.time} ({shw.hallName})
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950/80 px-6 py-4 text-center text-xs text-zinc-500">
        Cine Center Bolivia © 2026 — Red de Microservicios Distribuidos Multi-Cloud
      </footer>
    </div>
  );
};
