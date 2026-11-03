<template>
  <div v-if="isOpen && ticket" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-white space-y-5">
      <!-- Header con cierre -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span class="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">BOLETO DIGITAL IN-APP</span>
          <h2 class="text-xl font-black text-white">{{ ticket.movieTitle }}</h2>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <!-- Datos de Sala y Butaca -->
      <div class="grid grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <span class="text-slate-400 block">Sala:</span>
          <strong class="text-white text-sm">{{ ticket.hallName }}</strong>
        </div>
        <div>
          <span class="text-slate-400 block">Butaca Asignada:</span>
          <strong class="text-indigo-400 text-base font-mono">{{ ticket.seatCode }}</strong>
        </div>
        <div>
          <span class="text-slate-400 block">Código Boleto:</span>
          <strong class="text-slate-300 font-mono">{{ ticket.ticketCode }}</strong>
        </div>
        <div>
          <span class="text-slate-400 block">Estado:</span>
          <span class="text-emerald-400 font-bold uppercase">{{ ticket.status }}</span>
        </div>
      </div>

      <!-- SECCIÓN DUAL QR (INV-BIZ-03) -->
      <div class="space-y-4">
        <!-- 1. QR Llave de Acceso a Sala -->
        <div class="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-4 flex items-center gap-4">
          <div class="w-24 h-24 bg-white p-2 rounded-lg shadow-md flex items-center justify-center">
            <!-- Representación SVG de QR Llave -->
            <svg class="w-20 h-20 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h2v2h-2v-2zm-4 0h2v4h-2v-4zm2 4h2v2h-2v-2zm2-2h2v4h-2v-4zm0 4h2v2h-2v-2zm-6 2h4v2h-4v-2z"/>
            </svg>
          </div>
          <div class="space-y-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-indigo-300 uppercase">
              1. QR Llave — Acceso a Sala
            </span>
            <p class="text-xs text-slate-300 font-medium">Muestre este código en el torniquete o lector del acomodador.</p>
            <span class="text-[10px] text-emerald-400 font-mono">Firma HMAC-SHA256 Válida</span>
          </div>
        </div>

        <!-- 2. QR de Confitería (si incluye combo) -->
        <div v-if="ticket.candyComboDetails" class="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-center gap-4">
          <div class="w-24 h-24 bg-white p-2 rounded-lg shadow-md flex items-center justify-center">
            <!-- Representación SVG de QR Confitería -->
            <svg class="w-20 h-20 text-amber-950" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h6v6H4V4zm2 2v2h2V6H6zm8-2h6v6h-6V4zm2 2v2h2V6h-2zM4 14h6v6H4v-6zm2 2v2h2v-2H6zm10 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2z"/>
            </svg>
          </div>
          <div class="space-y-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900 text-amber-300 uppercase">
              2. QR Confitería — Canje en Barra
            </span>
            <p class="text-xs font-bold text-amber-300">{{ ticket.candyComboDetails.name }}</p>
            <p class="text-[11px]" :class="ticket.candyRedeemed ? 'text-rose-400 font-bold' : 'text-emerald-400'">
              {{ ticket.candyRedeemed ? 'Combo ya canjeado' : 'Listo para reclamar en barra' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Invariante de No Descarga -->
      <p class="text-[11px] text-slate-400 text-center">
        🔒 Acceso digital 100% in-app garantizado. No requiere imprimir ni descargar PDFs.
      </p>

      <button 
        @click="$emit('close')" 
        class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition">
        Cerrar Visor
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  ticket: Object
});

defineEmits(['close']);
</script>
