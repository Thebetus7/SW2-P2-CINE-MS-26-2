<template>
  <div class="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between">
    <!-- Top Bar del Terminal POS con Badges de Módulo y Salud -->
    <header class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <ActiveModuleBadge />
        <HealthBadge />
      </div>

      <div class="flex items-center gap-3">
        <a 
          href="http://localhost:3000/" 
          class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          title="Regresar a la URL principal de Taquilla">
          <span>🎬</span> Portal Taquilla (:3000)
        </a>
        <a 
          href="/admin/media" 
          class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5">
          <span>🎞️</span> Repositorio de Afiches
        </a>
        <span class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm shadow-emerald-950">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Terminal Conectada
        </span>
      </div>
    </header>

    <!-- Subheader con datos de caja y cajero -->
    <div class="my-4 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🍿</span>
        <div>
          <h1 class="text-lg font-black tracking-tight text-white flex items-center gap-2">
            TERMINAL POS CONFITERÍA — CANJE RÁPIDO
          </h1>
          <p class="text-xs text-slate-400">
            Caja Activa: <strong class="text-amber-400">{{ counterId }}</strong> | Operador: <strong class="text-emerald-400">{{ cashierName }}</strong>
          </p>
        </div>
      </div>

      <button 
        @click="openTicketViewerDemo" 
        class="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5">
        <span>🎟️</span> Probar Visor In-App Doble QR
      </button>
    </div>

    <!-- Contenido Principal -->
    <main class="grid grid-cols-1 lg:grid-cols-3 gap-6 my-2 flex-1 items-start">
      <!-- Columna 1 y 2: Lector y Feedback Visual -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Input de Escaneo Rápido con Autofocus y Teclado Táctil -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Escanear Código QR de Confitería o Ingresar Token</span>
            <span class="text-[11px] text-amber-400 font-mono">Lector Láser Activo</span>
          </label>

          <div class="flex gap-3">
            <input 
              type="text" 
              ref="barcodeInput"
              v-model="scanInput"
              @keydown.enter="processScan"
              placeholder="Escanee con el lector o ingrese ej. CANDY-TOKEN-8841..."
              class="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-base text-white font-mono tracking-wider focus:outline-none transition shadow-inner" />
            <button 
              @click="processScan" 
              class="px-6 py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-900/30 transition flex items-center gap-2 cursor-pointer">
              <span>⚡</span> Canjear
            </button>
          </div>

          <!-- Teclado Tactil Numerico en Pantalla para Mostrador (PLAN-05, RB-06.6) -->
          <div class="pt-2 border-t border-slate-800/80">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teclado Táctil de Mostrador</span>
              <span class="text-[10px] text-slate-500">Optimizado para Pantallas Touch</span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button 
                v-for="digit in ['1','2','3','4','5','6','7','8','9','0','-','TCK-']" 
                :key="digit"
                @click="appendChar(digit)"
                type="button"
                class="h-12 bg-slate-800/70 hover:bg-slate-700 active:bg-amber-600 active:text-black border border-slate-700 rounded-xl font-mono font-bold text-base text-slate-200 transition flex items-center justify-center cursor-pointer shadow-sm">
                {{ digit }}
              </button>
              <button 
                @click="deleteLastChar"
                type="button"
                class="h-12 bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 border border-rose-800/60 rounded-xl font-bold text-xs text-rose-300 transition flex items-center justify-center cursor-pointer">
                ⌫ BORRAR
              </button>
              <button 
                @click="clearInput"
                type="button"
                class="h-12 bg-slate-800/50 hover:bg-slate-700/60 active:scale-95 border border-slate-700 rounded-xl font-bold text-xs text-slate-400 transition flex items-center justify-center cursor-pointer">
                LIMPIAR
              </button>
              <button 
                @click="processScan"
                type="button"
                class="col-span-2 h-12 bg-amber-600 hover:bg-amber-500 active:scale-95 border border-amber-500 rounded-xl font-bold text-xs text-white uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-950">
                <span>⚡</span> CONFIRMAR CANJE
              </button>
            </div>
          </div>

          <!-- Accesos Rapidos de Prueba -->
          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
            <span class="font-semibold text-[11px] text-slate-500">Vouchers Demo:</span>
            <button 
              @click="setDemoVoucher('CANDY-TOKEN-8841')" 
              type="button"
              class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px] rounded-lg border border-slate-700 transition">
              CANDY-TOKEN-8841 (Duplicado)
            </button>
            <button 
              @click="setDemoVoucher('CANDY-NEW-VOUCHER-9923')" 
              type="button"
              class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[11px] rounded-lg border border-slate-700 transition">
              CANDY-NEW-9923 (Válido)
            </button>
          </div>

          <p class="text-[11px] text-slate-500">
            💡 Presione ENTER o dispare el lector láser de código de barras para procesar de forma atómica e irreversible.
          </p>
        </div>

        <!-- Feedback Exitoso (RB-03.3) -->
        <div v-if="successResult" class="bg-emerald-950/80 border-2 border-emerald-600 rounded-2xl p-6 text-emerald-200 shadow-2xl animate-fade-in space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-emerald-800">
            <div class="flex items-center gap-2">
              <span class="text-2xl">✅</span>
              <h2 class="text-lg font-bold text-emerald-100">¡CANJE DE CONFITERÍA AUTORIZADO!</h2>
            </div>
            <span class="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-emerald-900 text-emerald-300">
              {{ successResult.ticketCode }}
            </span>
          </div>

          <div class="bg-slate-950/80 p-4 rounded-xl space-y-2 border border-emerald-800/40">
            <span class="text-xs text-slate-400 uppercase tracking-wider">Productos a Entregar al Cliente:</span>
            <h3 class="text-xl font-black text-amber-400">{{ successResult.comboName }}</h3>
            <ul class="list-disc list-inside text-sm text-slate-200 space-y-1 pt-1">
              <li v-for="(item, idx) in successResult.comboItems" :key="idx" class="font-medium">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="flex flex-wrap items-center justify-between text-xs text-emerald-400 pt-2 border-t border-emerald-900/50 gap-2">
            <span>Película: <strong class="text-white">{{ successResult.movieTitle }}</strong> (Sala: {{ successResult.hallName }})</span>
            <span class="font-mono">Auditoría UTC: {{ successResult.audit.redeemedAtUtc }}</span>
          </div>
        </div>

        <!-- Alerta de Bloqueo por Duplicidad (RB-03.3 / CANDY_ALREADY_REDEEMED) -->
        <div v-if="duplicateError" class="bg-rose-950/90 border-2 border-rose-600 rounded-2xl p-6 text-rose-200 shadow-2xl space-y-3">
          <div class="flex items-center gap-2 text-rose-300 text-lg font-bold pb-2 border-b border-rose-800">
            <span class="text-2xl">🚫</span>
            <span>ALERTA DE DUPLICIDAD — CANJE BLOQUEADO</span>
          </div>
          <p class="text-sm font-semibold leading-relaxed">
            {{ duplicateError }}
          </p>
          <div class="p-3 bg-slate-950/80 rounded-xl border border-rose-900 text-xs text-slate-300">
            Este boleto ya fue entregado y no puede ser redimido por segunda vez para evitar duplicidad en mostrador.
          </div>
        </div>
      </div>

      <!-- Columna 3: Registro de Auditoría en Vivo -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Auditoría de Canjes en Turno</span>
          <span class="text-amber-400 font-mono font-bold">{{ redemptionHistory.length }} canjes</span>
        </h3>

        <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          <div 
            v-for="(item, idx) in redemptionHistory" 
            :key="idx"
            class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1 shadow-sm">
            <div class="flex items-center justify-between">
              <strong class="text-amber-400 font-bold">{{ item.comboName }}</strong>
              <span class="text-[10px] text-slate-500 font-mono">{{ item.time }}</span>
            </div>
            <p class="text-slate-300 font-medium">{{ item.ticketCode }} — {{ item.movieTitle }}</p>
            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
              <span>Caja: {{ item.counterId }}</span>
              <span class="text-emerald-400 font-medium">Entregado OK</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Visor In-App Doble QR (INV-BIZ-03) -->
    <TicketViewerModal 
      :is-open="isTicketModalOpen"
      :ticket="demoTicket"
      @close="isTicketModalOpen = false" />

    <!-- Notificaciones Banners Toasts (RF-UX-07) -->
    <ToastContainer ref="toastRef" />

    <!-- Footer del Terminal POS -->
    <footer class="pt-4 border-t border-slate-900 text-center text-xs text-slate-500">
      Cine Center Operations — Sistema Monolítico Unificado de Confitería y Boletos Digitales (Puerto 8080)
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ActiveModuleBadge from '@/Components/ActiveModuleBadge.vue';
import HealthBadge from '@/Components/HealthBadge.vue';
import ToastContainer from '@/Components/ToastContainer.vue';
import TicketViewerModal from '@/Components/TicketViewerModal.vue';

const counterId = ref('CAJA-01');
const cashierName = ref('Cajero General (cajero@test.com)');
const scanInput = ref('');
const successResult = ref(null);
const duplicateError = ref('');
const toastRef = ref(null);
const isTicketModalOpen = ref(false);

const redeemedTokens = ref(new Set(['TCK-BOL-8841']));

const redemptionHistory = ref([
  {
    ticketCode: 'TCK-BOL-8841',
    movieTitle: 'Dune: Part Two',
    comboName: 'Combo Dúo Clásico',
    counterId: 'CAJA-01',
    time: '14:25 UTC'
  }
]);

const demoTicket = ref({
  ticketCode: 'TCK-BOL-9923',
  movieTitle: 'Gladiator II',
  hallName: 'Sala VIP Platinum',
  seatCode: 'B4',
  status: 'ISSUED',
  candyComboDetails: {
    name: 'Combo VIP Platinum Nachos & Pipoca',
    items: ['Nachos con Queso Cheddar x1', 'Pipoca Mantequilla x1', 'Refresco 32oz x2']
  },
  candyRedeemed: false,
});

const openTicketViewerDemo = () => {
  isTicketModalOpen.value = true;
};

const processScan = () => {
  duplicateError.value = '';
  successResult.value = null;

  const code = scanInput.value.trim();
  if (!code) return;

  // Validación de duplicidad simulada (RB-03.3)
  if (redeemedTokens.value.has(code) || code === 'TCK-BOL-8841' || code === 'CANDY-TOKEN-COMBO-DUO-8841') {
    duplicateError.value = `ADVERTENCIA DE DUPLICIDAD: Este combo ya fue canjeado previamente a las 14:25 UTC por el cajero cajero@test.com en CAJA-01.`;
    toastRef.value?.addToast(
      'Voucher Ya Canjeado Previamente',
      'error',
      'Intento de Doble Canje'
    );
    scanInput.value = '';
    return;
  }

  // Canje exitoso
  redeemedTokens.value.add(code);
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC';

  successResult.value = {
    ticketCode: code.startsWith('TCK') ? code : `TCK-${code}`,
    movieTitle: 'Gladiator II',
    hallName: 'Sala VIP Platinum',
    comboName: 'Combo Mega VIP Nachos & Pipoca',
    comboItems: ['Nachos Grandes con Queso Cheddar x1', 'Pipoca Mantequilla x1', 'Refresco 32oz x2'],
    audit: {
      cashierId: 'cajero@test.com',
      counterId: counterId.value,
      redeemedAtUtc: nowStr,
    }
  };

  redemptionHistory.value.unshift({
    ticketCode: successResult.value.ticketCode,
    movieTitle: successResult.value.movieTitle,
    comboName: successResult.value.comboName,
    counterId: counterId.value,
    time: nowStr
  });

  toastRef.value?.addToast(
    'Combo Entregado Satisfactoriamente',
    'success',
    'Canje Confirmado'
  );

  scanInput.value = '';
};

const appendChar = (char) => {
  scanInput.value += char;
};

const deleteLastChar = () => {
  scanInput.value = scanInput.value.slice(0, -1);
};

const clearInput = () => {
  scanInput.value = '';
  duplicateError.value = '';
  successResult.value = null;
};

const setDemoVoucher = (code) => {
  scanInput.value = code;
};
</script>
